import { createHash } from "node:crypto";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
// app/api/file-upload/route.ts
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

const BUCKET = process.env.S3_BUCKET_NAME || "myteramemories";
const MODEL_ID = process.env.AWS_BEDROCK_MODEL_ID || "amazon.nova-pro-v1:0";

type LlmResponse = {
  category: "patient" | "provider" | "medspa";
  s3Key: string;
  metadata: Record<string, string>;
};

const SYSTEM_INSTRUCTIONS = `
You are a strict file-routing agent for a MedSpa AI platform.
Decide where each uploaded file belongs (patient, provider, or medspa scope) and
return a single JSON object WITHOUT any additional text or markdown.

1. If the file clearly concerns a single patient → category "patient".
2. If the file is personal reference material for the uploading nurse / provider → "provider".
3. If the file is intended for the whole MedSpa workspace → "medspa".

Build the s3Key exactly using the templates:

patient:  memories/{medSpaId}/{providerId}/{patientId}/documents/{originalFilename}_{uuid}
provider: memories/{medSpaId}/{providerId}/documents/{originalFilename}_{uuid}
medspa:   memories/{medSpaId}/documents/{originalFilename}_{uuid}

Return exactly the following JSON structure:
{
  "category": "...",
  "s3Key": "string",
  "metadata": { /* keys described below */ }
}

The "metadata" object MUST include:
- medSpaId: (string) The ID of the MedSpa.
- providerId: (string) The ID of the provider uploading the file.
- patientId: (string) The ID of the patient, if applicable (use "unknown" if not a patient file).
- originalFilename: (string) The original name of the file.
- mimeType: (string) The MIME type of the file.
- sha256: (string) The SHA256 hash of the file.
- summary: (string) A concise one-sentence summary of the file content (max 25 words).

You may add other helpful keys to "metadata" if relevant, but do NOT remove the required ones.
Return ONLY the raw JSON object.
`.trim();

/* ----------------------------------------------------------------------- */
// helper: create the Bedrock request body, assuming a Converse-API-like structure
// for models like Amazon Nova.
function buildBedrockNovaPayload(userMessageContent: Record<string, unknown>) {
  // Constructing the user message content. For Nova models using a Converse-like API,
  // the user message content is often an array of content blocks.
  // The primary content is text.
  const userMessages = [{ text: JSON.stringify(userMessageContent, null, 2) }];

  return {
    // Some models (like Anthropic's Claude via Converse) might require an explicit version.
    // For Amazon Nova, this might not be needed, or might be different.
    // e.g., "anthropic_version": "bedrock-2023-05-31",
    messages: [
      {
        role: "user", // For now, putting system instructions implicitly or as part of user prompt.
        // Some models allow a "system" role message here.
        content: userMessages,
      },
      // If SYSTEM_INSTRUCTIONS are lengthy or complex, and the model supports a dedicated system prompt
      // outside the 'messages' array or as a 'system' role message, that would be preferable.
      // For now, the system instructions are implicitly part of the task definition given to the user role.
      // Alternatively, prepend SYSTEM_INSTRUCTIONS to the user's first message content if no system role is supported.
    ],
    // An explicit instruction to the model about the expected output format,
    // especially for JSON, can be helpful if the model supports it.
    // This is often part of the prompt itself, as done in SYSTEM_INSTRUCTIONS.
    // Some models might have a specific parameter for JSON mode.
  };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const file = form.get("file") as File | null;
    const medSpaId = (form.get("medSpaId") as string | null) ?? "unknown";
    const providerId = (form.get("providerId") as string | null) ?? "unknown";
    const patientId = (form.get("patientId") as string | null) ?? "unknown";
    const uploaderNote = (form.get("note") as string | null) ?? "";

    if (!file) {
      return NextResponse.json({ error: "No file field provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    const uuidSuffix = nanoid(8);
    const originalName = file.name.replace(/\s+/g, "_");

    // For PDF, DOCX, images, this excerpt will be "binary file..."
    // True content processing for these types requires specific libraries (e.g., pdf-parse, mammoth)
    // and potentially a multimodal LLM that can accept base64 image data or structured document content.
    // The 'amazon.nova-pro-v1:0' model IS multimodal, but this code currently only sends a text excerpt.
    const excerpt =
      file.type.startsWith("text/") || file.type === "application/json"
        ? buffer.subarray(0, 2048).toString("utf8")
        : `binary file (MIME type: ${file.type}, content not processed beyond this excerpt)`;

    // The user payload now includes the full system instructions to guide the LLM.
    // This is because we are not using a separate system prompt field in this payload structure.
    const userPayloadForLLM = {
      // Explicitly include system instructions as part of the user-provided context
      // if the model doesn't have a dedicated "system" role in its messages API.
      taskDescription: SYSTEM_INSTRUCTIONS,
      fileDetails: {
        // Nesting the actual file details
        medSpaId,
        providerId,
        patientId,
        originalFilename: originalName,
        mimeType: file.type,
        sha256,
        fileExcerpt: excerpt,
        uploaderNote,
        uuid: uuidSuffix,
      },
    };

    const bedrockRequestBody = buildBedrockNovaPayload(userPayloadForLLM);

    const invokeRes = await bedrock.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: "application/json",
        accept: "application/json", // We expect a JSON response from Bedrock
        body: Buffer.from(JSON.stringify(bedrockRequestBody)),
      }),
    );

    const responseBodyText = new TextDecoder().decode(invokeRes.body);
    const responseBodyParsed = JSON.parse(responseBodyText);
    let llmJsonOutput: LlmResponse;

    // Parsing logic for Converse-like API responses:
    // The actual content is often in `response.output.message.content[0].text`
    // or similar, depending on the exact model.
    if (
      responseBodyParsed?.output?.message?.content &&
      Array.isArray(responseBodyParsed.output.message.content) &&
      responseBodyParsed.output.message.content.length > 0 &&
      responseBodyParsed.output.message.content[0].text
    ) {
      const outputText = responseBodyParsed.output.message.content[0].text;
      try {
        llmJsonOutput = JSON.parse(outputText);
      } catch (e) {
        console.warn(
          "Direct JSON parsing of output.message.content[0].text failed, attempting to extract JSON:",
          outputText,
        );
        const jsonMatch = outputText.match(/\{[\s\S]*\}/);
        if (jsonMatch?.[0]) {
          try {
            llmJsonOutput = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            console.error(
              "Failed to parse extracted JSON from outputText:",
              jsonMatch[0],
              parseError,
            );
            throw new Error("LLM response contained malformed JSON in outputText.");
          }
        } else {
          console.error("No JSON object found in LLM outputText:", outputText);
          throw new Error("LLM outputText did not contain identifiable JSON content.");
        }
      }
    } else if (responseBodyParsed.completion) {
      // Some models might use 'completion'
      const outputText = responseBodyParsed.completion;
      try {
        llmJsonOutput = JSON.parse(outputText);
      } catch (e) {
        console.warn(
          "Direct JSON parsing of 'completion' failed, attempting to extract JSON:",
          outputText,
        );
        const jsonMatch = outputText.match(/\{[\s\S]*\}/);
        if (jsonMatch?.[0]) {
          try {
            llmJsonOutput = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            console.error(
              "Failed to parse extracted JSON from 'completion':",
              jsonMatch[0],
              parseError,
            );
            throw new Error("LLM response contained malformed JSON in 'completion'.");
          }
        } else {
          console.error("No JSON object found in LLM 'completion':", outputText);
          throw new Error("LLM 'completion' did not contain identifiable JSON content.");
        }
      }
    } else {
      console.error(
        "Bedrock response format unexpected. Expected Converse-like 'output.message.content[0].text' or 'completion'. Response:",
        responseBodyParsed,
      );
      // As a last resort, try to parse the whole response if it's simple JSON
      try {
        llmJsonOutput = responseBodyParsed as LlmResponse;
        if (!llmJsonOutput.category || !llmJsonOutput.s3Key || !llmJsonOutput.metadata) {
          // This will throw if the direct cast doesn't fit the LlmResponse structure
          throw new Error("Parsed response body does not match LlmResponse structure.");
        }
      } catch (finalParseError) {
        console.error("Final attempt to parse entire response body also failed:", finalParseError);
        throw new Error(
          "LLM response format was not recognized or did not contain the expected data.",
        );
      }
    }

    const { category, s3Key, metadata: llmMetadata } = llmJsonOutput;

    if (!category || !s3Key || !llmMetadata) {
      console.error(
        "LLM response missing one or more required fields (category, s3Key, metadata):",
        llmJsonOutput,
      );
      throw new Error("LLM response did not adhere to the expected JSON structure after parsing.");
    }

    console.log("LLM Parsed Output:", { category, s3Key, metadata: llmMetadata });

    const finalS3Metadata = {
      ...llmMetadata,
      medSpaId: String(llmMetadata.medSpaId || medSpaId),
      providerId: String(llmMetadata.providerId || providerId),
      patientId: String(llmMetadata.patientId || patientId),
      originalFilename: String(llmMetadata.originalFilename || originalName),
      mimeType: String(llmMetadata.mimeType || file.type),
      sha256: String(llmMetadata.sha256 || sha256),
      uploadTimestamp: new Date().toISOString(),
      uploaderNote: uploaderNote,
    };

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
        Metadata: Object.fromEntries(
          Object.entries(finalS3Metadata).map(([k, v]) => [k.toLowerCase(), String(v)]),
        ),
      }),
    );

    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return NextResponse.json({ url, key: s3Key, metadata: finalS3Metadata });
  } catch (err) {
    console.error("upload-route error:", err);
    let errorMessage = "Upload failed. See server logs for details.";
    let statusCode = 500;

    if (err instanceof Error) {
      errorMessage = err.message;
      if (err.name === "ValidationException" || String(err).includes("ValidationException")) {
        statusCode = 400;
        errorMessage = `Bedrock model input validation failed: ${err.message}. Review the MODEL_ID and the Bedrock request payload structure. The current structure assumes a Converse-API-like model (e.g., for Amazon Nova).`;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
