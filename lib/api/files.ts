export interface PDFUploadResult {
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

export interface SearchResponse {
  success: boolean;
  results?: SearchResult[];
  totalResults?: number;
  error?: string;
}

export async function uploadPDFFile(
  file: File,
  threadId: string,
  userId?: string,
): Promise<PDFUploadResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("threadId", threadId);
    if (userId) {
      formData.append("userId", userId);
    }

    const response = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}`,
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function searchDocuments(
  query: string,
  options?: {
    fileIds?: string[];
    maxResults?: number;
    minScore?: number;
  },
): Promise<SearchResponse> {
  try {
    const response = await fetch("/api/files/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        fileIds: options?.fileIds,
        maxResults: options?.maxResults,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}`,
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}
