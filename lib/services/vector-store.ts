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
  chunks?: DocumentChunk[];
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

  async searchSimilarContent(
    query: string,
    options: VectorSearchOptions = {},
  ): Promise<SearchResult[]> {
    const {
      maxResults = Number.parseInt(process.env.MAX_SEARCH_RESULTS || "5", 10),
      minScore = Number.parseFloat(process.env.MIN_SIMILARITY_SCORE || "0.7"),
      chunks = [],
    } = options;

    console.log(`🔍 Searching for: "${query.substring(0, 50)}..."`);

    try {
      if (chunks.length === 0) {
        console.log("No chunks provided for search");
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

      // Generate embeddings for each chunk and perform search
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        let chunkEmbedding: number[];

        if (this.useBedrock) {
          try {
            chunkEmbedding = await generateBedrockEmbedding(chunk.content);
          } catch (error) {
            console.warn(`⚠️ AWS Bedrock failed for chunk ${i}, using simple embedding`);
            chunkEmbedding = generateSimpleEmbedding(chunk.content);
          }
        } else {
          chunkEmbedding = generateSimpleEmbedding(chunk.content);
        }

        const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);

        if (similarity >= minScore) {
          results.push({
            content: chunk.content,
            score: similarity,
            metadata: {
              chunkId: chunk.id,
              chunkIndex: chunk.metadata.chunkIndex,
              fileId: "", // No fileId in in-memory search
              fileName: "", // No fileName in in-memory search
            },
          });
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
}

// Singleton instance
export const vectorStoreService = new VectorStoreService();
