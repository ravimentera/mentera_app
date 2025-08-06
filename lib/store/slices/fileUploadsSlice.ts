import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";

export interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "file";
  file: File;
  previewUrl: string;
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
  files: UploadedFile[];
  searchResults: SearchResult[];
  isSearching: boolean;
  lastSearchQuery?: string;
}

const initialState: State = {
  files: [],
  searchResults: [],
  isSearching: false,
};

export const fileUploadsSlice = createSlice({
  name: "fileUploads",
  initialState,
  reducers: {
    addFile(state, action: PayloadAction<UploadedFile>) {
      state.files.push(action.payload);
    },
    removeFile(state, action: PayloadAction<string>) {
      state.files = state.files.filter((f) => f.id !== action.payload);
    },
    clear(state) {
      state.files = [];
    },
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
    reset: () => initialState,
  },
});

// Selectors
export const selectAllFiles = (s: RootState) => s.fileUploads.files;
export const selectSearchResults = (s: RootState) => s.fileUploads.searchResults;
export const selectIsSearching = (s: RootState) => s.fileUploads.isSearching;
export const selectLastSearchQuery = (s: RootState) => s.fileUploads.lastSearchQuery;

export const {
  addFile,
  removeFile,
  clear,
  setSearchResults,
  setSearching,
  clearSearchResults,
  reset,
} = fileUploadsSlice.actions;

export default fileUploadsSlice.reducer;
