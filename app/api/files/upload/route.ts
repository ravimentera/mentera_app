import { NextRequest, NextResponse } from "next/server";
import { processFile } from "@/lib/processors";
import { sanitizeFileName } from "@/lib/utils";
import { chunkDocument } from "@/lib/utils/document-chunker";
import { vectorStoreService } from "@/lib/services/vector-store";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const query = formData.get("query") as string;

    if (!file || !query) {
      return NextResponse.json({ success: false, error: "File and query are required" }, { status: 400 });
    }

    const sanitizedFileName = sanitizeFileName(file.name);
    const processingResult = await processFile(file);

    if (!processingResult.success) {
      return NextResponse.json({ success: false, error: processingResult.error }, { status: 400 });
    }

    const { text: extractedText } = processingResult;
    const { chunks } = await chunkDocument(extractedText);

    const searchResults = await vectorStoreService.searchSimilarContent(query, {
      chunks,
    });

    return NextResponse.json({ success: true, results: searchResults });
  } catch (error) {
    console.error("Upload and search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    );
  }
}
