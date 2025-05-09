import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  InvokeAgentCommandInput,
  InvokeAgentCommandOutput,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { NextRequest, NextResponse } from "next/server";

const agentId = process.env.BEDROCK_AGENT_ID;
const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID;
const region = process.env.AWS_REGION;

if (!agentId || !agentAliasId || !region) {
  console.error(
    "CRITICAL: Missing Bedrock Agent environment variables (BEDROCK_AGENT_ID, BEDROCK_AGENT_ALIAS_ID, AWS_REGION)",
  );
}

const bedrockAgentClient = new BedrockAgentRuntimeClient({ region });

interface LayoutRequestBody {
  markdown: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function isValidJson(text: string | null): boolean {
  if (text === null || typeof text !== "string" || text.trim() === "") {
    console.log("isValidJson: Input is null, not a string, or empty after trim. Returning false.");
    return false;
  }
  try {
    JSON.parse(text);
    console.log(
      "isValidJson: Successfully parsed. Returning true for text starting with:",
      text.substring(0, 70) + "...",
    );
    return true;
  } catch (e: any) {
    console.error(
      "isValidJson: Failed to parse. Error:",
      e.message,
      "For text starting with:",
      text.substring(0, 70) + "...",
    );
    return false;
  }
}

function extractJsonBlock(rawAgentResponse: string): string | null {
  console.log(
    "extractJsonBlock: Attempting to extract JSON. Input length:",
    rawAgentResponse?.length,
  );
  if (!rawAgentResponse || typeof rawAgentResponse !== "string") {
    console.log("extractJsonBlock: Input is null or not a string.");
    return null;
  }

  const fencedBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = rawAgentResponse.match(fencedBlockRegex);

  if (match?.[1]) {
    const extracted = match[1].trim();
    console.log(
      "extractJsonBlock: Found fenced JSON block. Content starts with:",
      extracted.substring(0, 70) + "...",
    );
    if (isValidJson(extracted)) {
      return extracted;
    }
    console.warn("extractJsonBlock: Fenced block found but content is not valid JSON.");
    return null;
  }
  console.log("extractJsonBlock: No valid fenced JSON block found.");

  const trimmedAgentResponse = rawAgentResponse.trim();
  if (trimmedAgentResponse.startsWith("{") && trimmedAgentResponse.endsWith("}")) {
    console.log(
      "extractJsonBlock: No fence found. Checking if entire trimmed response is JSON. Starts with:",
      trimmedAgentResponse.substring(0, 70) + "...",
    );
    if (isValidJson(trimmedAgentResponse)) {
      console.log("extractJsonBlock: Entire trimmed response is valid JSON.");
      return trimmedAgentResponse;
    }
    console.log(
      "extractJsonBlock: Entire trimmed response looked like JSON but failed validation.",
    );
  }

  console.log("extractJsonBlock: No extractable/valid JSON found in agent response.");
  return null;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  if (!agentId || !agentAliasId || !region) {
    console.error("Bedrock Agent configuration is incomplete for this request.");
    return NextResponse.json(
      { error: "Server configuration error for Bedrock Agent." },
      { status: 500 },
    );
  }

  try {
    const body = (await req.json()) as LayoutRequestBody;

    if (!body?.markdown || typeof body.markdown !== "string" || body.markdown.trim() === "") {
      return NextResponse.json(
        { error: "Invalid request: 'markdown' (non-empty string) is required" },
        { status: 400 },
      );
    }

    const inputText = `You are an expert AI assistant tasked with generating UI Layout Abstract Syntax Trees (ASTs) in JSON format.
You have access to a Knowledge Base containing metadata about prebuilt frontend UI components (including their names and available props).

Your goal is to:
1. Analyze the provided markdown content.
2. Consult your Knowledge Base to identify the most suitable prebuilt frontend components that correspond to the information and intent described in the markdown.
3. Construct a Layout AST JSON object using these components and their appropriate props, as defined in your Knowledge Base and relevant to the markdown.
4. The response MUST be ONLY the raw JSON object representing this Layout AST.

Strict Output Requirements:
- Your entire response must be a single, valid JSON object.
- DO NOT include any explanatory text, introductory phrases, apologies, summaries, or any characters whatsoever before or after the JSON object.
- DO NOT use markdown fences (like \`\`\`json or \`\`\`) around the JSON output. Return only the pure JSON.

Markdown Content to Process:
---
${body.markdown}
---
`;

    let lastError: any = null;
    let lastRawContent: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(
          `[Attempt ${attempt}/${MAX_RETRIES}] Invoking Bedrock Agent with inputText (first 100 chars): "${inputText.substring(0, 100).replace(/\n/g, " ")}..." for markdown: "${body.markdown.substring(0, 50)}..."`,
        );

        const input: InvokeAgentCommandInput = {
          agentId,
          agentAliasId,
          sessionId: crypto.randomUUID(), // Consider session management if context needs to persist across calls for a user
          inputText,
          enableTrace: false, // Set to true for debugging Bedrock traces
        };

        const command = new InvokeAgentCommand(input);
        const response: InvokeAgentCommandOutput = await bedrockAgentClient.send(command);

        let rawAgentContent = "";
        if (response.completion) {
          for await (const chunkEvent of response.completion) {
            if (chunkEvent.chunk?.bytes) {
              rawAgentContent += new TextDecoder("utf-8").decode(
                new Uint8Array(chunkEvent.chunk.bytes),
              );
            }
          }
        } else {
          console.warn(
            `[Attempt ${attempt}/${MAX_RETRIES}] Bedrock Agent response had no completion events.`,
          );
          lastError = new Error("Agent response was empty or had no completion stream.");
          lastRawContent = rawAgentContent;
          if (attempt < MAX_RETRIES) {
            await delay(RETRY_DELAY_MS);
            continue;
          }
          break;
        }

        lastRawContent = rawAgentContent;
        console.log(`[Attempt ${attempt}/${MAX_RETRIES}] Raw content from agent:`, rawAgentContent);

        const extractedJsonString = extractJsonBlock(rawAgentContent);

        if (extractedJsonString) {
          const layout = JSON.parse(extractedJsonString);
          console.log(`[Attempt ${attempt}/${MAX_RETRIES}] Successfully processed JSON layout.`);
          return NextResponse.json(layout);
        }

        console.warn(`[Attempt ${attempt}/${MAX_RETRIES}] Failed to extract valid JSON.`);
        lastError = new Error(
          "Agent did not return a recognizable and valid JSON structure based on the prompt's strict output requirements.",
        );
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
          continue;
        }
        break;
      } catch (error: any) {
        console.error(
          `[Attempt ${attempt}/${MAX_RETRIES}] Error during Bedrock Agent interaction:`,
          error.message || error,
        );
        lastError = error;
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
        }
      }
    }

    console.error("All attempts to fetch layout from Bedrock Agent failed.");
    return NextResponse.json(
      {
        error: "Failed to get valid layout from Bedrock Agent after multiple attempts.",
        details: lastError?.message || "No specific error message from last attempt.",
        lastRawAgentResponse: lastRawContent,
      },
      { status: 502 },
    );
  } catch (error: any) {
    console.error("Unhandled API Error:", error);
    return NextResponse.json(
      { error: error.message || "Unexpected server error" },
      { status: 500 },
    );
  }
}
