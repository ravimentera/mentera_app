import { BedrockEmbeddings } from "@langchain/aws";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
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

    let loader;
    if (file.type === "application/pdf") {
      loader = new PDFLoader(file);
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      loader = new DocxLoader(file);
    } else {
      return NextResponse.json({ success: false, error: "Unsupported file type" }, { status: 400 });
    }

    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splits = await textSplitter.splitDocuments(docs);

    const embeddings = new BedrockEmbeddings({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
      model: "amazon.titan-embed-text-v2:0",
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(splits, embeddings);

    const searchResults = await vectorStore.similaritySearch(query, 5);

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
