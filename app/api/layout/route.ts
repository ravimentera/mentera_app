import { mockData } from "@/mock/mockTera/mockData";
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  InvokeAgentCommandInput,
  InvokeAgentCommandOutput,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { NextRequest, NextResponse } from "next/server";

// Environment variables
const agentId = process.env.BEDROCK_AGENT_ID;
const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID;
const region = process.env.AWS_REGION;

// Determine if mocking is enabled for the API route
// const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
// @TODO: make it false after demo
const ENABLE_MOCK_LAYOUT_API = true; // IS_DEVELOPMENT && process.env.NEXT_PUBLIC_ENABLE_MOCK_CHAT === 'true';

if (!ENABLE_MOCK_LAYOUT_API && (!agentId || !agentAliasId || !region)) {
  console.error(
    "CRITICAL: Missing Bedrock Agent environment variables (BEDROCK_AGENT_ID, BEDROCK_AGENT_ALIAS_ID, AWS_REGION) and mock is disabled.",
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
    return false;
  }
  try {
    JSON.parse(text);
    return true;
  } catch (e: any) {
    return false;
  }
}

function extractJsonBlock(rawAgentResponse: string): string | null {
  if (!rawAgentResponse || typeof rawAgentResponse !== "string") {
    return null;
  }
  const fencedBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = rawAgentResponse.match(fencedBlockRegex);
  if (match?.[1]) {
    const extracted = match[1].trim();
    if (isValidJson(extracted)) return extracted;
    return null;
  }
  const trimmedAgentResponse = rawAgentResponse.trim();
  if (trimmedAgentResponse.startsWith("{") && trimmedAgentResponse.endsWith("}")) {
    if (isValidJson(trimmedAgentResponse)) return trimmedAgentResponse;
  }
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

    // --- Mocking Logic ---
    if (ENABLE_MOCK_LAYOUT_API) {
      console.log(
        "[Mock API /api/layout] Mocking enabled. Searching for markdown in mockData.js...",
      );
      const incomingMarkdownTrimmed = body.markdown.trim();

      const matchedEntry = mockData.find(
        (entry) => entry.markdown.trim() === incomingMarkdownTrimmed,
      );

      if (matchedEntry) {
        console.log(
          "[Mock API /api/layout] Found matching markdown in mockData.js. Query:",
          matchedEntry.query,
        );
        let layoutPayload: any = matchedEntry.layout;

        if (typeof layoutPayload === "string") {
          console.log(
            "[Mock API /api/layout] Layout from mockData is a string. Attempting to parse. String starts with:",
            layoutPayload.substring(0, 100) + "...",
          );
          try {
            layoutPayload = JSON.parse(layoutPayload);
          } catch (e: any) {
            // Catch specific error 'e'
            console.error(
              "[Mock API /api/layout] Failed to parse layout string from mockData.js. Error:",
              e.message,
            );
            console.error(
              "[Mock API /api/layout] Problematic layout string (for query: '" +
                matchedEntry.query +
                "'):\n",
              matchedEntry.layout,
            ); // Log the problematic string
            return NextResponse.json(
              {
                error:
                  "Mock data for layout is malformed and could not be parsed as JSON. Please check for unescaped newlines or special characters within string values if your layout is a string in mockData.js. It's recommended to use direct JavaScript objects for layouts.",
                details: e.message, // Include the specific parsing error
                mockQuery: matchedEntry.query,
              },
              { status: 500 },
            );
          }
        }

        if (typeof layoutPayload === "object" && layoutPayload !== null) {
          console.log("[Mock API /api/layout] Returning mock layout object.");
          return NextResponse.json(layoutPayload);
          // biome-ignore lint/style/noUselessElse: reason for ignoring
        } else {
          console.error(
            "[Mock API /api/layout] Mock layout data is not a valid object after potential parse for query:",
            matchedEntry.query,
          );
          return NextResponse.json(
            { error: "Mock data for layout is not a valid object.", mockQuery: matchedEntry.query },
            { status: 500 },
          );
        }
        // biome-ignore lint/style/noUselessElse: ignored
      } else {
        console.warn(
          "[Mock API /api/layout] No exact markdown match found in mockData.js for the provided input:",
          incomingMarkdownTrimmed.substring(0, 100) + "...",
        );
        return NextResponse.json(
          {
            error:
              "Mock mode enabled, but no matching markdown found in mockData.js for the provided input.",
          },
          { status: 404 },
        );
      }
    }
    // --- End Mocking Logic ---

    // If mocking is not enabled, proceed with Bedrock Agent
    if (!agentId || !agentAliasId || !region) {
      console.error("Bedrock Agent configuration is incomplete for this request.");
      return NextResponse.json(
        { error: "Server configuration error for Bedrock Agent." },
        { status: 500 },
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
          `[Bedrock API /api/layout Attempt ${attempt}/${MAX_RETRIES}] Invoking for markdown: "${body.markdown.substring(0, 50)}..."`,
        );
        const inputCmd: InvokeAgentCommandInput = {
          agentId,
          agentAliasId,
          sessionId: crypto.randomUUID(),
          inputText,
          enableTrace: false,
        };
        const command = new InvokeAgentCommand(inputCmd);
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
          lastError = new Error("Agent response empty/no completion stream.");
          lastRawContent = rawAgentContent;
          if (attempt < MAX_RETRIES) {
            await delay(RETRY_DELAY_MS);
            continue;
          }
          break;
        }
        lastRawContent = rawAgentContent;
        console.log(
          `[Bedrock API /api/layout Attempt ${attempt}/${MAX_RETRIES}] Raw content:`,
          rawAgentContent,
        );
        const extractedJsonString = extractJsonBlock(rawAgentContent);
        if (extractedJsonString) {
          const layout = JSON.parse(extractedJsonString);
          return NextResponse.json(layout);
        }
        lastError = new Error("Agent did not return recognizable/valid JSON.");
        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
          continue;
        }
        break;
      } catch (error: any) {
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
