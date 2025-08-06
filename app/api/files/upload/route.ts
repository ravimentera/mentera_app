import { RAGPipelineService } from "@/lib/rag/pipeline";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const query = formData.get("query") as string;

    if (!file || !query) {
      return NextResponse.json(
        { success: false, error: "File and query are required" },
        { status: 400 },
      );
    }

    const ragPipeline = new RAGPipelineService();
    const searchResults = await ragPipeline.processAndSearch(file, query);

    return NextResponse.json({ success: true, results: searchResults });
  } catch (error) {
    console.error("Upload and search error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Internal server error: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    );
  }
}
