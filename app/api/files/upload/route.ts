import { processFile } from "@/lib/processors";
import { sanitizeFileName } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

interface UploadResponse {
  success: boolean;
  fileId?: string;
  fileName?: string;
  chunkCount?: number;
  metadata?: {
    pages: number;
    wordCount: number;
    processingTimeMs: number;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  const startTime = Date.now();

  try {
    console.log("Upload route called");

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const threadId = formData.get("threadId") as string;

    const sanitizedFileName = sanitizeFileName(file.name);

    console.log("Form data contents:", {
      hasFile: !!file,
      fileName: sanitizedFileName,
      fileSize: file?.size,
      fileType: file?.type,
      threadId,
    });

    // Validate inputs
    if (!file || !threadId) {
      return NextResponse.json(
        { success: false, error: !file ? "No file provided" : "Thread ID is required" },
        { status: 400 },
      );
    }

    const processingResult = await processFile(file);

    if (!processingResult.success) {
      return NextResponse.json({ success: false, error: processingResult.error }, { status: 400 });
    }

    const { text: extractedText, pages } = processingResult;

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "No meaningful text content found in document" },
        { status: 422 },
      );
    }

    const fileId = uuidv4();

    // Chunk the text
    console.log("Chunking document...");
    const chunks = [];
    const chunkSize = 1000;
    const chunkOverlap = 200;

    for (let i = 0; i < extractedText.length; i += chunkSize - chunkOverlap) {
      const chunk = extractedText.slice(i, i + chunkSize);
      if (chunk.trim().length > 50) {
        chunks.push({
          id: `chunk_${chunks.length}`,
          content: chunk.trim(),
          metadata: {
            chunkIndex: chunks.length,
            startChar: i,
            endChar: i + chunk.length,
            wordCount: chunk.trim().split(/\s+/).length,
          },
        });
      }
    }

    console.log("Document chunked successfully:", chunks.length, "chunks");

    if (chunks.length === 0) {
      return NextResponse.json(
        { success: false, error: "Could not create meaningful chunks from document content" },
        { status: 422 },
      );
    }

    const wordCount = extractedText.split(/\s+/).length;

    // Create vector store with actual implementation
    try {
      console.log("Creating vector store...");
      const { vectorStoreService } = await import("@/lib/services/vector-store");

      // This actually creates embeddings and stores them
      await vectorStoreService.createVectorStore(fileId, sanitizedFileName, chunks, threadId, {
        pages: pages || 0,
        wordCount,
      });
      console.log("Vector store created successfully for fileId:", fileId);
    } catch (vectorError) {
      console.error("Vector store creation failed:", vectorError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create document embeddings: " + (vectorError as Error).message,
        },
        { status: 500 },
      );
    }

    const processingTime = Date.now() - startTime;

    console.log(`document upload completed successfully: ${sanitizedFileName} (${fileId})`);

    return NextResponse.json({
      success: true,
      fileId,
      fileName: sanitizedFileName,
      chunkCount: chunks.length,
      metadata: {
        pages: pages || 0,
        wordCount,
        processingTimeMs: processingTime,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

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

export async function GET() {
  return NextResponse.json({
    message: "Document Upload API is working",
    timestamp: new Date().toISOString(),
    status: "healthy",
  });
}
