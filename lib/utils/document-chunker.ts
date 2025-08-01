import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    chunkIndex: number;
    startChar: number;
    endChar: number;
    wordCount: number;
  };
}

export interface ChunkingResult {
  chunks: DocumentChunk[];
  totalChunks: number;
  metadata: {
    originalLength: number;
    chunkedLength: number;
    chunkingStrategy: string;
  };
}

export async function chunkDocument(
  text: string,
  options?: {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
  },
): Promise<ChunkingResult> {
  const chunkSize = options?.chunkSize || Number.parseInt(process.env.CHUNK_SIZE || "1000");
  const chunkOverlap = options?.chunkOverlap || Number.parseInt(process.env.CHUNK_OVERLAP || "200");

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: options?.separators || ["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", ""],
  });

  const textChunks = await textSplitter.splitText(text);

  const chunks: DocumentChunk[] = textChunks.map((chunk, index) => {
    const startChar = index === 0 ? 0 : text.indexOf(chunk);
    return {
      id: `chunk_${index}`,
      content: chunk,
      metadata: {
        chunkIndex: index,
        startChar,
        endChar: startChar + chunk.length,
        wordCount: chunk.split(/\s+/).length,
      },
    };
  });

  return {
    chunks,
    totalChunks: chunks.length,
    metadata: {
      originalLength: text.length,
      chunkedLength: chunks.reduce((sum, chunk) => sum + chunk.content.length, 0),
      chunkingStrategy: "recursive_character",
    },
  };
}
