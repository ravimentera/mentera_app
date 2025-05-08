import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  InvokeAgentCommandInput,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { NextRequest, NextResponse } from "next/server";

import { layout3 } from "@/mock/layoutData";

const agentId = process.env.BEDROCK_AGENT_ID;
const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID;
const region = process.env.AWS_REGION;

const bedrockAgentClient = new BedrockAgentRuntimeClient({ region });

interface LayoutRequestBody {
  markdown: string;
}

function isValidJson(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function extractJsonBlock(markdownText: string): string | null {
  const match = markdownText.match(/```json\s*([\s\S]*?)\s*```/);
  return match?.[1]?.trim() || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LayoutRequestBody;

    if (!body?.markdown || typeof body.markdown !== "string") {
      return NextResponse.json(
        { error: "Invalid request: 'markdown' is required" },
        { status: 400 },
      );
    }

    const input: InvokeAgentCommandInput = {
      agentId,
      agentAliasId,
      sessionId: crypto.randomUUID(),
      inputText: `Help me generate the Layout AST JSON structure for the given markdown: ${body.markdown}`,
    };

    // const command = new InvokeAgentCommand(input);
    // const response = await bedrockAgentClient.send(command);
    // const typedResponse = response as any;

    // let content = "";

    // for await (const chunkEvent of typedResponse.completion) {
    //   if (chunkEvent.chunk?.bytes) {
    //     const byteArray = new Uint8Array(chunkEvent.chunk.bytes);
    //     const decodedChunk = new TextDecoder("utf-8").decode(byteArray);
    //     content += decodedChunk;
    //   }
    // }

    // const extractJsonObj = extractJsonBlock(content)

    // // Check if it's valid JSON before parsing
    // if (!isValidJson(extractJsonObj!)) {
    //   return NextResponse.json(
    //     {
    //       error: "Agent returned non-JSON output",
    //       message: content,
    //     },
    //     { status: 502 }
    //   );
    // }

    // const layout = JSON.parse(extractJsonObj!);
    // return NextResponse.json(layout);
    return NextResponse.json(layout3);
  } catch (error: any) {
    console.error("Bedrock Agent Error:", error);
    return NextResponse.json(
      { error: error.message || "Unexpected server error" },
      { status: 500 },
    );
  }
}
