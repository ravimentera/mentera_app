// lib/store/fileUploadsSlice.ts
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";

export interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "file";
  file: File;
  previewUrl: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  threadId: string;
  fileId?: string; // Actual file ID from server after processing
  chunkCount: number;
  uploadedAt: number;
  status: "uploading" | "processing" | "processed" | "error";
  error?: string;
  metadata?: {
    pages: number;
    wordCount: number;
    processingTimeMs: number;
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

interface State {
  files: UploadedFile[]; // Existing files for backward compatibility
  documentFiles: DocumentFile[]; // New document files
  searchResults: SearchResult[];
  isSearching: boolean;
  lastSearchQuery?: string;
}

const initialState: State = {
  files: [],
  documentFiles: [],
  searchResults: [],
  isSearching: false,
};

export const fileUploadsSlice = createSlice({
  name: "fileUploads",
  initialState,
  reducers: {
    // Existing actions
    addFile(state, action: PayloadAction<UploadedFile>) {
      state.files.push(action.payload);
    },
    removeFile(state, action: PayloadAction<string>) {
      state.files = state.files.filter((f) => f.id !== action.payload);
    },
    clear(state) {
      state.files = [];
    },

    // New document file actions
    addDocumentFile(state, action: PayloadAction<DocumentFile>) {
      state.documentFiles.push(action.payload);
    },
    updateDocumentFileStatus(
      state,
      action: PayloadAction<{
        id: string;
        status?: DocumentFile["status"];
        fileId?: string;
        chunkCount?: number;
        error?: string;
        metadata?: DocumentFile["metadata"];
      }>,
    ) {
      const index = state.documentFiles.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        const file = state.documentFiles[index];
        if (action.payload.status !== undefined) file.status = action.payload.status;
        if (action.payload.fileId !== undefined) file.fileId = action.payload.fileId;
        if (action.payload.chunkCount !== undefined) file.chunkCount = action.payload.chunkCount;
        if (action.payload.error !== undefined) file.error = action.payload.error;
        if (action.payload.metadata !== undefined) file.metadata = action.payload.metadata;
      }
    },
    removeDocumentFile(state, action: PayloadAction<string>) {
      state.documentFiles = state.documentFiles.filter((f) => f.id !== action.payload);
    },

    // Search actions
    setSearchResults(
      state,
      action: PayloadAction<{
        results: SearchResult[];
        query: string;
      }>,
    ) {
      state.searchResults = action.payload.results;
      state.lastSearchQuery = action.payload.query;
      state.isSearching = false;
    },
    setSearching(state, action: PayloadAction<boolean>) {
      state.isSearching = action.payload;
    },
    clearSearchResults(state) {
      state.searchResults = [];
      state.lastSearchQuery = undefined;
      state.isSearching = false;
    },

    // Reset all
    reset: () => initialState,
  },
});

// Selectors
export const selectAllFiles = (s: RootState) => s.fileUploads.files;
export const selectAllDocumentFiles = (s: RootState) => s.fileUploads.documentFiles;
export const selectDocumentFilesByThread = (s: RootState, threadId: string) =>
  s.fileUploads.documentFiles.filter((f) => f.threadId === threadId);
export const selectProcessedDocumentFiles = (s: RootState) =>
  s.fileUploads.documentFiles.filter((f) => f.status === "processed");
export const selectSearchResults = (s: RootState) => s.fileUploads.searchResults;
export const selectIsSearching = (s: RootState) => s.fileUploads.isSearching;
export const selectLastSearchQuery = (s: RootState) => s.fileUploads.lastSearchQuery;

export const {
  // Existing actions
  addFile,
  removeFile,
  clear,

  // New actions
  addDocumentFile,
  updateDocumentFileStatus,
  removeDocumentFile,
  setSearchResults,
  setSearching,
  clearSearchResults,
  reset,
} = fileUploadsSlice.actions;

export default fileUploadsSlice.reducer;
