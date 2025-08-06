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

export interface UploadAndSearchResult {
  success: boolean;
  results?: SearchResult[];
  error?: string;
}

export async function uploadAndSearch(file: File, query: string): Promise<UploadAndSearchResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("query", query);

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
      error: error instanceof Error ? error.message : "Upload and search failed",
    };
  }
}
