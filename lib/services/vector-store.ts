import { fileStorage } from "@/lib/storage/file-storage";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

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

export interface SearchResult {
  content: string;
  score: number;
  metadata: {
    chunkId: string;
    chunkIndex: number;
    fileId: string;
    fileName: string;
  };
}

export interface VectorSearchOptions {
  maxResults?: number;
  minScore?: number;
  fileId?: string | string[];
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// Simple text-based embedding generation (for development without AWS)
function generateSimpleEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0); // Smaller dimension for simplicity

  // Simple hash-based embedding
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const charCode = word.charCodeAt(i);
      const index = (charCode * (i + 1)) % embedding.length;
      embedding[index] += 1;
    }
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

// Generate AWS Bedrock embedding
async function generateBedrockEmbedding(text: string): Promise<number[]> {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials not configured");
  }

  const client = new BedrockRuntimeClient({ region: "us-east-1" });
  const modelId = "amazon.titan-embed-text-v2:0";

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    body: JSON.stringify({
      inputText: text,
    }),
  });

  try {
    const response = await client.send(command);
    if (!response.body) {
      throw new Error("No response body from Bedrock");
    }
    const decodedBody = new TextDecoder().decode(response.body);
    const parsedBody = JSON.parse(decodedBody);
    return parsedBody.embedding;
  } catch (error) {
    console.error("AWS Bedrock embedding failed:", error);
    throw error;
  }
}

export class VectorStoreService {
  private useBedrock: boolean;

  constructor() {
    this.useBedrock = !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY;
    console.log(
      `🔧 VectorStoreService using ${this.useBedrock ? "AWS Bedrock" : "simple"} embeddings`,
    );
  }

  async createVectorStore(
    fileId: string,
    fileName: string,
    chunks: DocumentChunk[],
    threadId: string,
    metadata: { pages: number; wordCount: number },
  ): Promise<void> {
    try {
      console.log(`📊 Creating embeddings for ${chunks.length} chunks...`);

      const embeddings: number[][] = [];

      // Generate embeddings for each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`🔄 Processing chunk ${i + 1}/${chunks.length}`);

        let embedding: number[];

        if (this.useBedrock) {
          try {
            embedding = await generateBedrockEmbedding(chunk.content);
          } catch (error) {
            console.warn(`⚠️ AWS Bedrock failed for chunk ${i}, using simple embedding`);
            embedding = generateSimpleEmbedding(chunk.content);
          }
        } else {
          embedding = generateSimpleEmbedding(chunk.content);
        }

        embeddings.push(embedding);
      }

      // Save to persistent storage
      const fileData = {
        fileId,
        fileName,
        threadId,
        chunks,
        embeddings,
        uploadedAt: Date.now(),
        metadata,
      };

      await fileStorage.saveFile(fileData);

      console.log(`✅ Vector store created and saved for ${fileName} (${fileId})`);
    } catch (error) {
      console.error(`❌ Error creating vector store for file ${fileId}:`, error);
      throw error;
    }
  }

  async searchSimilarContent(
    query: string,
    options: VectorSearchOptions = {},
  ): Promise<SearchResult[]> {
    const {
      maxResults = Number.parseInt(process.env.MAX_SEARCH_RESULTS || "5", 10),
      minScore = Number.parseFloat(process.env.MIN_SIMILARITY_SCORE || "0.7"),
      fileId,
    } = options;

    console.log(`🔍 Searching for: "${query.substring(0, 50)}..."`);

    try {
      // Load files from storage
      let filesToSearch;
      if (fileId && typeof fileId === "string") {
        const file = await fileStorage.loadFile(fileId);
        filesToSearch = file ? [file] : [];
      } else if (Array.isArray(fileId) && fileId.length > 0) {
        filesToSearch = await fileStorage.loadFiles(fileId);
      } else {
        filesToSearch = await fileStorage.getAllFiles();
      }

      console.log(`📁 Found ${filesToSearch.length} files to search`);

      if (filesToSearch.length === 0) {
        console.log("No files available for search");
        return [];
      }

      // Generate query embedding
      let queryEmbedding: number[];
      if (this.useBedrock) {
        try {
          queryEmbedding = await generateBedrockEmbedding(query);
        } catch (error) {
          console.warn("⚠️ AWS Bedrock failed for query, using simple embedding");
          queryEmbedding = generateSimpleEmbedding(query);
        }
      } else {
        queryEmbedding = generateSimpleEmbedding(query);
      }

      const results: SearchResult[] = [];

      // Search through all files
      for (const file of filesToSearch) {
        for (let i = 0; i < file.chunks.length; i++) {
          const chunk = file.chunks[i];
          const chunkEmbedding = file.embeddings[i];

          if (!chunkEmbedding) continue;

          const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);

          console.log({ similarity });

          if (similarity >= minScore) {
            results.push({
              content: chunk.content,
              score: similarity,
              metadata: {
                chunkId: chunk.id,
                chunkIndex: chunk.metadata.chunkIndex,
                fileId: file.fileId,
                fileName: file.fileName,
              },
            });
          }
        }
      }

      // Sort by score and limit results
      const sortedResults = results.sort((a, b) => b.score - a.score).slice(0, maxResults);

      console.log(`✅ Search completed: ${sortedResults.length} relevant results found`);

      return sortedResults;
    } catch (error) {
      console.error("❌ Error searching vector store:", error);
      return [];
    }
  }

  async removeVectorStore(fileId: string): Promise<boolean> {
    try {
      const success = await fileStorage.deleteFile(fileId);
      console.log(`🗑️ Vector store removed for file ${fileId}: ${success}`);
      return success;
    } catch (error) {
      console.error("❌ Error removing vector store:", error);
      return false;
    }
  }

  async getStoredFileIds(): Promise<string[]> {
    try {
      const fileIds = await fileStorage.getAllFileIds();
      console.log(`📋 Found ${fileIds.length} stored files`);
      return fileIds;
    } catch (error) {
      console.error("❌ Error getting stored file IDs:", error);
      return [];
    }
  }

  async getFileMetadata(fileId: string) {
    try {
      const file = await fileStorage.loadFile(fileId);
      return file
        ? {
            fileName: file.fileName,
            chunks: file.chunks.length,
            threadId: file.threadId,
            uploadedAt: file.uploadedAt,
            metadata: file.metadata,
          }
        : null;
    } catch (error) {
      console.error("❌ Error getting file metadata:", error);
      return null;
    }
  }

  async getStats() {
    try {
      const files = await fileStorage.getAllFiles();
      return {
        totalFiles: files.length,
        fileIds: files.map((f) => f.fileId),
        files: files.map((f) => ({
          fileId: f.fileId,
          fileName: f.fileName,
          threadId: f.threadId,
          chunks: f.chunks.length,
          uploadedAt: f.uploadedAt,
        })),
      };
    } catch (error) {
      console.error("❌ Error getting stats:", error);
      return {
        totalFiles: 0,
        fileIds: [],
        files: [],
      };
    }
  }
}

// Singleton instance
export const vectorStoreService = new VectorStoreService();
