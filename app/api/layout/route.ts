// app/api/layout/route.ts
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  InvokeAgentCommandInput,
  InvokeAgentCommandOutput,
  TracePart,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { NextRequest, NextResponse } from "next/server";
import { handleMockLayoutRequest } from "./mockLayoutHandler";

// Environment variables
const agentId = process.env.BEDROCK_AGENT_ID || "YLGT5ZEQ0Q";
const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID || "MIOIB6QJTI";
const region = process.env.AWS_REGION || "us-east-1";

// Determine if mocking is enabled for the API route
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
// @TODO: make it false after demo
const ENABLE_MOCK_LAYOUT_API = true;
// const ENABLE_MOCK_LAYOUT_API =
//   IS_DEVELOPMENT && process.env.NEXT_PUBLIC_ENABLE_MOCK_CHAT === "true";

if (!ENABLE_MOCK_LAYOUT_API && (!agentId || !agentAliasId || !region)) {
  console.error(
    "CRITICAL: Missing Bedrock Agent environment variables (BEDROCK_AGENT_ID, BEDROCK_AGENT_ALIAS_ID, AWS_REGION) and mock is disabled.",
  );
}

const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: region,
});

interface LayoutRequestBody {
  markdown: string;
  sessionId: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function isValidJson(text: string | null): boolean {
  if (text === null || typeof text !== "string" || text.trim() === "") return false;
  try {
    JSON.parse(text);
    return true;
  } catch (e) {
    return false;
  }
}

function extractJsonBlock(rawAgentResponse: string): string | null {
  if (!rawAgentResponse || typeof rawAgentResponse !== "string") {
    console.warn("extractJsonBlock: Input is null or not a string.");
    return null;
  }
  // console.log("extractJsonBlock: Attempting to extract JSON from raw response (length:", rawAgentResponse.length, ")");
  const fencedBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const fencedMatch = rawAgentResponse.match(fencedBlockRegex);
  if (fencedMatch?.[1]) {
    const extractedFenced = fencedMatch[1].trim();
    if (isValidJson(extractedFenced)) return extractedFenced;
    console.warn("extractJsonBlock: Fenced block found, but its content is not valid JSON.");
  } else {
    /* console.log("extractJsonBlock: No fenced JSON block found."); */
  }

  const firstBrace = rawAgentResponse.indexOf("{");
  const lastBrace = rawAgentResponse.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const potentialJson = rawAgentResponse.substring(firstBrace, lastBrace + 1).trim();
    if (isValidJson(potentialJson)) return potentialJson;
    console.warn("extractJsonBlock: Substring between first '{' and last '}' is not valid JSON.");
  } else {
    /* console.log("extractJsonBlock: Could not find plausible JSON structure (based on '{' and '}')."); */
  }

  const trimmedAgentResponse = rawAgentResponse.trim();
  if (trimmedAgentResponse.startsWith("{") && trimmedAgentResponse.endsWith("}")) {
    if (isValidJson(trimmedAgentResponse)) return trimmedAgentResponse;
    console.warn(
      "extractJsonBlock: Entire trimmed response looked like JSON but failed validation (last resort check).",
    );
  }
  // console.log("extractJsonBlock: No extractable and valid JSON found after all attempts.");
  return null;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LayoutRequestBody;
    if (!body?.markdown || typeof body.markdown !== "string" || body.markdown.trim() === "") {
      return NextResponse.json(
        { error: "Invalid request: 'markdown' (non-empty string) is required" },
        { status: 400 },
      );
    }

    if (ENABLE_MOCK_LAYOUT_API) {
      const mockResponse = await handleMockLayoutRequest(body.markdown);
      if (mockResponse) return mockResponse;
    }

    if (!agentId || !agentAliasId || !region) {
      console.error("Bedrock Agent configuration is incomplete for this request.");
      return NextResponse.json(
        { error: "Server configuration error for Bedrock Agent." },
        { status: 500 },
      );
    }

    const inputText = `You are an expert AI assistant embedded in a multi-agent medical spa system. Your role is to convert the given markdown content into a UI Layout Abstract Syntax Tree (AST) JSON object.

You must:
1. Parse the markdown content to understand its semantic structure.
2. Reference the \`components.md\` metadata for available UI components, their prop types, and intended usage.
3. Follow domain-specific workflows typical of a medical spa environment (e.g., scheduling, procedures, care instructions).
4. Select components that best match the content and populate them with accurate props derived from the markdown.

Additional Instructions for Components:
- Always match the **exact shape and required fields** as defined in the component metadata for each component.
- For **AppointmentCalendar**, each appointment object must:
  - Include all required fields:
    - \`id\`: string
    - \`chartId\`: string
    - \`patient\`: { firstName, lastName, condition? }
    - \`provider\`: { providerId, firstName, lastName, specialties }
    - \`startTime\` and \`endTime\`: ISO 8601 format (e.g., "2025-05-13T12:30:00Z")
    - \`type\`: "therapy" | "consultation" | "followup" | "general"
  - Default \`status\` should be set to \`"pending"\` unless explicitly provided.
  - Avoid creating simplified or custom structures like { date, procedure }.
- For **ApprovalsContainer**, each \`ApprovalCardData\` object must:
  - Include all required fields:
    - \`id\`: string  // Corresponds to Appointment ID
    - \`appointmentId\`: string
    - \`patientName\`: string
    - \`patientId\`: string
    - \`isVip\`: boolean
    - \`time\`: string  // Formatted time string e.g., "Today, 10:00 AM"
    - \`subject\`: string
    - \`message\`: string  // The current message to be sent/approved
    - \`originalMessage\`: string  // The original message from notificationStatus
    - \`notificationType\`: "pre-care" | "post-care"
  - Optional fields (if applicable):
    - \`aiGeneratedMessage?\`: string  // AI's suggested alternative
    - \`chatHistory?\`: ApprovalChatMessage[]
    - \`messageVariant?\`: number  // 0 for original/current, 1 for AI, 2+ for alternatives
    - \`showTeraCompose?\`: boolean
    - \`editedMessage?\`: string  // If user edits the message directly in the approval card

- Do not omit any prop that is required or semantically relevant in \`components.md\`.
- You may infer values such as \`procedure\`, \`doctor\`, or \`title\` when logically implied in the markdown.

Strict Output Policy:
- Your entire response must be a single, valid JSON object.
- Do NOT include:
  - Markdown fences (like \`\`\`json)
  - Explanatory or planning text
  - Natural language summaries or descriptions
  - Anything before or after the JSON block

Your output must adhere to the Layout AST structure with:
- Root object must include: \`type: "Layout"\`, a \`title\`, and a \`layout: []\` array.
- Each layout item must be a \`Grid\` with \`columns\`, \`gap\`, and \`rows\`.
- Rows must contain \`Component\` entries with a \`name\` and fully populated \`props\`.

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
          `[Bedrock API /api/layout Attempt ${attempt}/${MAX_RETRIES}] Invoking for markdown: "${body.markdown.substring(0, 50)}..."`,
        );
        const inputCmd: InvokeAgentCommandInput = {
          agentId,
          agentAliasId,
          sessionId: body.sessionId,
          inputText,
          enableTrace: true,
        };
        const command = new InvokeAgentCommand(inputCmd);
        const response: InvokeAgentCommandOutput = await bedrockAgentClient.send(command);

        let rawAgentContent = "";
        const traceParts: TracePart[] = []; // To store trace parts

        if (response.completion) {
          for await (const event of response.completion) {
            // Renamed chunkEvent to event for clarity
            if (event.chunk?.bytes) {
              // This is a PayloadPart
              const decodedChunk = new TextDecoder("utf-8").decode(
                new Uint8Array(event.chunk.bytes),
              );
              rawAgentContent += decodedChunk;
              // console.log("[Bedrock Stream Chunk]:", decodedChunk); // Log individual chunks if needed
            } else if (event.trace?.trace) {
              // This is a TracePart
              // console.log("[Bedrock Stream Trace]:", JSON.stringify(event.trace.trace, null, 2));
              traceParts.push(event.trace.trace as TracePart); // Collect trace parts
            }
          }
        } else {
          lastError = new Error("Agent response empty/no completion stream.");
          lastRawContent = rawAgentContent; // Store even if empty
          if (attempt < MAX_RETRIES) {
            await delay(RETRY_DELAY_MS);
            continue;
          }
          break;
        }

        lastRawContent = rawAgentContent; // Store the latest full raw content
        console.log(
          `[Bedrock API /api/layout Attempt ${attempt}/${MAX_RETRIES}] Full raw content from agent:`,
          rawAgentContent,
        );

        if (traceParts.length > 0) {
          console.log(
            `[Bedrock API /api/layout Attempt ${attempt}/${MAX_RETRIES}] Collected Trace Parts:`,
          );
          traceParts.forEach((trace, index) => {
            console.log(`--- Trace Part ${index + 1} ---`);
            console.log(JSON.stringify(trace, null, 2));
            // You can inspect specific parts of the trace, e.g., trace.orchestration, trace.invocationInput etc.
          });
        }

        if (rawAgentContent.trim() === "") {
          console.warn(
            `[Bedrock API /api/layout Attempt ${attempt}/${MAX_RETRIES}] Agent returned empty content after stream completion.`,
          );
          lastError = new Error("Agent returned empty content.");
          if (attempt < MAX_RETRIES) {
            await delay(RETRY_DELAY_MS);
            continue;
          }
          break;
        }

        const extractedJsonString = extractJsonBlock(rawAgentContent);
        if (extractedJsonString) {
          const layout = JSON.parse(extractedJsonString);
          console.log(
            `[Bedrock API /api/layout Attempt ${attempt}/${MAX_RETRIES}] Successfully parsed JSON layout.`,
          );
          return NextResponse.json(layout);
        }

        lastError = new Error(
          "Agent did not return recognizable/valid JSON after extraction attempts. Check trace logs for details.",
        );
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
          continue;
        }
        break;
      } catch (error: any) {
        console.error(
          `[Bedrock API /api/layout Attempt ${attempt}/${MAX_RETRIES}] Error during Bedrock Agent interaction:`,
          error,
        );
        lastError = error;
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
        }
      }
    }
    return NextResponse.json(
      {
        error: "Bedrock Agent failed after multiple attempts.",
        details: lastError?.message,
        lastRawAgentResponse: lastRawContent,
      },
      { status: 502 },
    );
  } catch (error: any) {
    console.error("/api/layout Unhandled Error:", error);
    return NextResponse.json(
      { error: error.message || "Unexpected server error" },
      { status: 500 },
    );
  }
}
