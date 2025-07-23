import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";

export interface TranscriptionState {
  isConnected: boolean;
  isRecording: boolean;
  sessionId: string | null;
  transcription: string;
  finalTranscript: string;
  error: string | null;
  connectionStatus: "idle" | "connecting" | "connected" | "disconnected" | "error";
}

const initialState: TranscriptionState = {
  isConnected: false,
  isRecording: false,
  sessionId: null,
  transcription: "",
  finalTranscript: "",
  error: null,
  connectionStatus: "idle",
};

const transcriptionSlice = createSlice({
  name: "transcription",
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<TranscriptionState["connectionStatus"]>) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === "connected";
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    setRecordingState: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    appendTranscription: (state, action: PayloadAction<string>) => {
      state.transcription += (state.transcription ? "\n" : "") + action.payload;
    },
    setFinalTranscript: (state, action: PayloadAction<string>) => {
      state.finalTranscript = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetTranscription: (state) => {
      state.transcription = "";
      state.finalTranscript = "";
      state.error = null;
    },
    resetSession: (state) => {
      return initialState;
    },
  },
});

export const {
  setConnectionStatus,
  setSessionId,
  setRecordingState,
  appendTranscription,
  setFinalTranscript,
  setError,
  resetTranscription,
  resetSession,
} = transcriptionSlice.actions;

// Selectors
export const selectTranscriptionState = (state: RootState) => state.transcription;
export const selectIsConnected = (state: RootState) => state.transcription.isConnected;
export const selectIsRecording = (state: RootState) => state.transcription.isRecording;
export const selectSessionId = (state: RootState) => state.transcription.sessionId;
export const selectTranscription = (state: RootState) => state.transcription.transcription;
export const selectFinalTranscript = (state: RootState) => state.transcription.finalTranscript;
export const selectTranscriptionError = (state: RootState) => state.transcription.error;
export const selectConnectionStatus = (state: RootState) => state.transcription.connectionStatus;

export const transcriptionReducer = transcriptionSlice.reducer;
