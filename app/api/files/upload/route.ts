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

// Alternative PDF text extraction function
async function extractPDFText(buffer: Buffer): Promise<{
  text: string;
  pages: number;
  error?: string;
}> {
  try {
    // Try to use pdf-parse with proper error handling
    const pdfParse = require("pdf-parse/lib/pdf-parse.js");

    const options = {
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    };

    const data = await pdfParse(buffer, options);

    return {
      text: data.text || "",
      pages: data.numpages || 0,
    };
  } catch (pdfParseError) {
    console.log("pdf-parse failed, trying alternative method:", pdfParseError.message);

    try {
      // Fallback text extraction
      const bufferString = buffer.toString("binary");
      const textRegex = /BT\s*(.*?)\s*ET/gs;
      const matches = bufferString.match(textRegex);

      let extractedText = "";
      if (matches) {
        matches.forEach((match) => {
          const cleanText = match
            .replace(/BT|ET/g, "")
            .replace(/Tj|TJ|Tm|Td|TD/g, " ")
            .replace(/\([^)]*\)/g, (match) => {
              return match.slice(1, -1);
            })
            .replace(/[<>]/g, "")
            .replace(/\s+/g, " ")
            .trim();

          if (cleanText.length > 2) {
            extractedText += cleanText + " ";
          }
        });
      }

      const pageBreaks = (bufferString.match(/\/Type\s*\/Page/g) || []).length;
      const estimatedPages = Math.max(1, pageBreaks);

      if (extractedText.trim().length > 10) {
        return {
          text: extractedText.trim(),
          pages: estimatedPages,
        };
      } else {
        throw new Error("No readable text found in PDF");
      }
    } catch (fallbackError) {
      return {
        text: "",
        pages: 0,
        error:
          "Could not extract text from PDF. The file may be image-based, encrypted, or corrupted.",
      };
    }
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  const startTime = Date.now();

  try {
    console.log("Upload route called");

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const threadId = formData.get("threadId") as string;

    console.log("Form data contents:", {
      hasFile: !!file,
      fileName: file?.name,
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

    // File validation
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.type !== "application/pdf") {
      return NextResponse.json({ success: false, error: "File must be a PDF" }, { status: 400 });
    }

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: `File size must be less than ${maxSizeBytes / 1024 / 1024}MB` },
        { status: 400 },
      );
    }

    const fileId = uuidv4();

    // Convert file to buffer
    console.log("Converting file to buffer...");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    console.log("Extracting text from PDF...");
    const pdfResult = await extractPDFText(buffer);

    if (pdfResult.error) {
      return NextResponse.json({ success: false, error: pdfResult.error }, { status: 422 });
    }

    const extractedText = pdfResult.text;
    const pages = pdfResult.pages;

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "No meaningful text content found in PDF" },
        { status: 422 },
      );
    }

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
        { success: false, error: "Could not create meaningful chunks from PDF content" },
        { status: 422 },
      );
    }

    const wordCount = extractedText.split(/\s+/).length;

    // Create vector store with actual implementation
    try {
      console.log("Creating vector store...");
      const { vectorStoreService } = await import("@/lib/services/vector-store");

      // This actually creates embeddings and stores them
      await vectorStoreService.createVectorStore(fileId, file.name, chunks, threadId, {
        pages,
        wordCount,
      });
      console.log("Vector store created successfully for fileId:", fileId);
    } catch (vectorError) {
      console.error("Vector store creation failed:", vectorError);
      return NextResponse.json(
        { success: false, error: "Failed to create document embeddings: " + vectorError.message },
        { status: 500 },
      );
    }

    const processingTime = Date.now() - startTime;

    console.log(`PDF upload completed successfully: ${file.name} (${fileId})`);

    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.name,
      chunkCount: chunks.length,
      metadata: {
        pages,
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
    message: "PDF Upload API is working",
    timestamp: new Date().toISOString(),
    status: "healthy",
  });
}
