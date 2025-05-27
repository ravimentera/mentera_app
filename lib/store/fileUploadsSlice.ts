// lib/store/fileUploadsSlice.ts
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "./index";

export interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "file";
  url: string | "__uploading__";
}

interface State {
  files: UploadedFile[];
}

const initialState: State = { files: [] };

export const fileUploadsSlice = createSlice({
  name: "fileUploads",
  initialState,
  reducers: {
    addFile: (state, action: PayloadAction<UploadedFile>) => {
      state.files.push(action.payload);
    },
    updateFileUrl: (state, action: PayloadAction<{ id: string; url: string }>) => {
      const f = state.files.find((x) => x.id === action.payload.id);
      if (f) f.url = action.payload.url;
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter((f) => f.id !== action.payload);
    },
    /** Remove *all* pending / uploaded files */
    clear: (state) => {
      state.files = [];
    },
    /** Same as `clear`, but named for the “after-send” use-case */
    reset: () => initialState,
  },
});

export const selectAllFiles = (state: RootState) => state.fileUploads.files;

export const { addFile, updateFileUrl, removeFile, clear, reset } = fileUploadsSlice.actions;

export default fileUploadsSlice.reducer;
