import { NextRequest, NextResponse } from "next/server";

interface SearchRequest {
  query: string;
  fileIds?: string[];
  maxResults?: number;
  minScore?: number;
}

interface SearchResponse {
  success: boolean;
  results?: Array<{
    content: string;
    score: number;
    metadata: {
      chunkId: string;
      chunkIndex: number;
      fileId: string;
      fileName: string;
    };
  }>;
  totalResults?: number;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    console.log("Search route called");

    const body: SearchRequest = await request.json();
    const { query, fileIds, maxResults = 5, minScore = 0.3 } = body; // Lowered minScore

    console.log("Search parameters:", {
      query: query?.substring(0, 50) + "...",
      fileIds,
      maxResults,
      minScore,
    });

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 });
    }

    // Get the vector store service
    const { vectorStoreService } = await import("@/lib/services/vector-store");

    // Check if we have any stored files
    const storedFileIds = await vectorStoreService.getStoredFileIds(); // Added await
    console.log("Available file IDs in vector store:", storedFileIds);

    if (storedFileIds.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        totalResults: 0,
      });
    }

    // Perform the search
    console.log("Performing vector search...");
    const searchResults = await vectorStoreService.searchSimilarContent(query, {
      maxResults,
      minScore,
      fileId: fileIds,
    });

    console.log(`Search completed: found ${searchResults.length} results`);

    return NextResponse.json({
      success: true,
      results: searchResults,
      totalResults: searchResults.length,
    });
  } catch (error) {
    console.error("Search error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// GET endpoint to check available files
export async function GET() {
  try {
    const { vectorStoreService } = await import("@/lib/services/vector-store");
    const storedFileIds = await vectorStoreService.getStoredFileIds(); // Added await
    const stats = await vectorStoreService.getStats(); // Added await

    return NextResponse.json({
      message: "Search API is working",
      availableFiles: storedFileIds,
      fileCount: storedFileIds.length,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Search API error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
