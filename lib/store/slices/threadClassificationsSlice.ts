// lib/store/slices/threadClassificationsSlice.ts
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
export interface ThreadClassification {
  threadId: string;
  scope: "patient" | "provider" | "medspa";
  requiresPatient: boolean;
  confidence: number;
  classifiedAt: number; // timestamp when classified
  isFirstQueryProcessed: boolean; // track if first query was enhanced
}

export interface ThreadClassificationsState {
  classifications: Record<string, ThreadClassification>; // threadId -> classification
}

/* -------------------------------------------------------------------------- */
/*  Initial state                                                             */
/* -------------------------------------------------------------------------- */
const initialState: ThreadClassificationsState = {
  classifications: {},
};

/* -------------------------------------------------------------------------- */
/*  Slice                                                                     */
/* -------------------------------------------------------------------------- */
export const threadClassificationsSlice = createSlice({
  name: "threadClassifications",
  initialState,
  reducers: {
    /* -------- SET CLASSIFICATION ----------------------------------------- */
    setThreadClassification: (
      state,
      action: PayloadAction<{
        threadId: string;
        scope: "patient" | "provider" | "medspa";
        requiresPatient: boolean;
        confidence: number;
      }>,
    ) => {
      const { threadId, scope, requiresPatient, confidence } = action.payload;
      state.classifications[threadId] = {
        threadId,
        scope,
        requiresPatient,
        confidence,
        classifiedAt: Date.now(),
        isFirstQueryProcessed: true,
      };
    },

    /* -------- MARK FIRST QUERY PROCESSED --------------------------------- */
    markFirstQueryProcessed: (state, action: PayloadAction<string>) => {
      const threadId = action.payload;
      if (state.classifications[threadId]) {
        state.classifications[threadId].isFirstQueryProcessed = true;
      }
    },

    /* -------- CLEAR CLASSIFICATION --------------------------------------- */
    clearThreadClassification: (state, action: PayloadAction<string>) => {
      const threadId = action.payload;
      delete state.classifications[threadId];
    },

    /* -------- CLEAR ALL CLASSIFICATIONS ---------------------------------- */
    clearAllClassifications: (state) => {
      state.classifications = {};
    },

    /* -------- BULK LOAD CLASSIFICATIONS ---------------------------------- */
    loadClassifications: (state, action: PayloadAction<Record<string, ThreadClassification>>) => {
      state.classifications = action.payload;
    },
  },
});

/* -------------------------------------------------------------------------- */
/*  Selectors                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Get classification for a specific thread
 */
export const selectThreadClassification = (
  state: RootState,
  threadId: string,
): ThreadClassification | null => {
  return state.threadClassifications.classifications[threadId] || null;
};

/**
 * Check if thread is classified (has had first query processed)
 */
export const selectIsThreadClassified = (state: RootState, threadId: string): boolean => {
  const classification = state.threadClassifications.classifications[threadId];
  return !!classification?.isFirstQueryProcessed;
};

/**
 * Check if thread needs first query enhancement
 */
export const selectNeedsFirstQueryEnhancement = (state: RootState, threadId: string): boolean => {
  const classification = state.threadClassifications.classifications[threadId];
  return !classification?.isFirstQueryProcessed;
};

/**
 * Get all classifications
 */
export const selectAllClassifications = (state: RootState) => {
  return state.threadClassifications.classifications;
};

/**
 * Get classification stats
 */
export const selectClassificationStats = (state: RootState) => {
  const classifications = Object.values(state.threadClassifications.classifications);
  return {
    total: classifications.length,
    patient: classifications.filter((c) => c.scope === "patient").length,
    provider: classifications.filter((c) => c.scope === "provider").length,
    medspa: classifications.filter((c) => c.scope === "medspa").length,
  };
};

/* -------------------------------------------------------------------------- */
/*  Exports                                                                   */
/* -------------------------------------------------------------------------- */
export const {
  setThreadClassification,
  markFirstQueryProcessed,
  clearThreadClassification,
  clearAllClassifications,
  loadClassifications,
} = threadClassificationsSlice.actions;

export default threadClassificationsSlice.reducer;
