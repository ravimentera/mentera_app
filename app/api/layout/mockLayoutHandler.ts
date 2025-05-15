import { mockData } from "@/mock/mockTera/mockData";
// app/api/layout/mockLayoutHandler.ts
import { NextResponse } from "next/server";

interface MatchedMockLayout {
  query: string;
  layout: any; // Can be an object or a string that needs parsing
}

/**
 * Handles the request by trying to find a mock layout based on the provided markdown.
 * @param incomingMarkdown The markdown string from the request body.
 * @returns A NextResponse object if a mock is found or an error occurs with mock data,
 * otherwise null if no mock is found (indicating the main handler should proceed).
 */
export async function handleMockLayoutRequest(
  incomingMarkdown: string,
): Promise<NextResponse | null> {
  console.log(
    "[Mock Handler /api/layout] Mocking enabled. Searching for markdown in mockData.js...",
  );
  const incomingMarkdownTrimmed = incomingMarkdown.trim();

  const matchedEntry = mockData.find((entry) => entry.markdown.trim() === incomingMarkdownTrimmed);

  if (matchedEntry) {
    console.log(
      "[Mock Handler /api/layout] Found matching markdown in mockData.js. Query:",
      matchedEntry.query,
    );
    let layoutPayload: any = matchedEntry.layout;

    if (typeof layoutPayload === "string") {
      console.log(
        "[Mock Handler /api/layout] Layout from mockData is a string. Attempting to parse. String starts with:",
        layoutPayload.substring(0, 100) + "...",
      );
      try {
        layoutPayload = JSON.parse(layoutPayload);
      } catch (e: any) {
        console.error(
          "[Mock Handler /api/layout] Failed to parse layout string from mockData.js. Error:",
          e.message,
        );
        console.error(
          "[Mock Handler /api/layout] Problematic layout string (for query: '" +
            matchedEntry.query +
            "'):\n",
          matchedEntry.layout,
        );
        return NextResponse.json(
          {
            error:
              "Mock data for layout is malformed and could not be parsed as JSON. Please check for unescaped newlines or special characters within string values if your layout is a string in mockData.js. It's recommended to use direct JavaScript objects for layouts.",
            details: e.message,
            mockQuery: matchedEntry.query,
          },
          { status: 500 },
        );
      }
    }

    if (typeof layoutPayload === "object" && layoutPayload !== null) {
      console.log("[Mock Handler /api/layout] Returning mock layout object.");
      return NextResponse.json(layoutPayload);
      // biome-ignore lint/style/noUselessElse: reason for ignoring
    } else {
      console.error(
        "[Mock Handler /api/layout] Mock layout data is not a valid object after potential parse for query:",
        matchedEntry.query,
      );
      return NextResponse.json(
        { error: "Mock data for layout is not a valid object.", mockQuery: matchedEntry.query },
        { status: 500 },
      );
    }
    // biome-ignore lint/style/noUselessElse: reason for ignoring
  } else {
    console.warn(
      "[Mock Handler /api/layout] No exact markdown match found in mockData.js for the provided input:",
      incomingMarkdownTrimmed.substring(0, 100) + "...",
    );
    // Return a specific response indicating no mock match, so the main route can decide to proceed or error.
    // For this refactor, we'll have the main route return a 404 if mock mode is on and no mock is found.
    return NextResponse.json(
      {
        error:
          "Mock mode enabled, but no matching markdown found in mockData.js for the provided input.",
      },
      { status: 404 }, // Not Found, as the specific mock isn't there
    );
  }
}
