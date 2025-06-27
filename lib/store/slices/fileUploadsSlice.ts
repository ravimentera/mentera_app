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

interface State {
  files: UploadedFile[];
}
const initialState: State = { files: [] };

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
    reset: () => initialState,
  },
});

export const selectAllFiles = (s: RootState) => s.fileUploads.files;
export const { addFile, removeFile, clear, reset } = fileUploadsSlice.actions;
export default fileUploadsSlice.reducer;
