// store/threadsSlice.ts
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import type { RootState } from "../index";
import type { Patient } from "../types/patient";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
export interface Thread {
  id: string;
  name: string;
  createdAt: number; // unix-ms
  lastMessageAt: number; // unix-ms
  remoteId?: string; // ← optional, nothing breaks if undefined
  externalId?: string;
  
  // Store original first message for better search
  originalFirstMessage?: string;

  // Thread Classification (merged from threadClassificationsSlice)
  scope?: "patient" | "provider" | "medspa";
  requiresPatient?: boolean;
  confidence?: number;
  classifiedAt?: number; // timestamp when classified
  isFirstQueryProcessed?: boolean; // track if first query was enhanced

  // Patient Management (moved from globalStateSlice)
  selectedPatientId?: string | null;
  selectedPatient?: Patient | null;
}

export interface ThreadsState {
  threads: Thread[];
  activeThreadId: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Initial state                                                             */
/* -------------------------------------------------------------------------- */
const initialState: ThreadsState = {
  threads: [],
  activeThreadId: null,
};

/* -------------------------------------------------------------------------- */
/*  Slice                                                                     */
/* -------------------------------------------------------------------------- */
export const threadsSlice = createSlice({
  name: "threads",
  initialState,
  reducers: {
    /* -------- CREATE ------------------------------------------------------ */
    addThread: (
      state,
      action: PayloadAction<{
        id?: string;
        name?: string;
        activate?: boolean;
      }>,
    ) => {
      const now = Date.now();
      const newThread: Thread = {
        id: action.payload.id ?? uuidv4(),
        name: action.payload.name ?? `New Chat ${state.threads.length + 1}`,
        createdAt: now,
        lastMessageAt: now,
        // Initialize classification and patient states
        isFirstQueryProcessed: false,
        selectedPatientId: null,
        selectedPatient: null,
      };

      state.threads.unshift(newThread);

      if (action.payload.activate !== false || !state.activeThreadId) {
        state.activeThreadId = newThread.id;
      }
    },

    /* -------- DELETE / ARCHIVE ------------------------------------------- */
    deleteThread: (state, action: PayloadAction<string>) => {
      state.threads = state.threads.filter((t) => t.id !== action.payload);

      if (state.activeThreadId === action.payload) {
        state.activeThreadId = state.threads[0]?.id ?? null;
      }
    },

    /* -------- SET ACTIVE (new action name) ------------------------------- */
    setActiveThreadId: (state, action: PayloadAction<string | null>) => {
      if (action.payload === null || state.threads.some((t) => t.id === action.payload)) {
        state.activeThreadId = action.payload;
      }
    },

    /* -------- Legacy alias (back-compat) ---------------------------------- */
    setActiveThread: (state, action: PayloadAction<string | null>) => {
      // just delegate to the new reducer
      threadsSlice.caseReducers.setActiveThreadId(state, action);
    },

    /* -------- UPDATE METADATA -------------------------------------------- */
    updateThreadName: (state, action: PayloadAction<{ id: string; name: string; originalMessage?: string }>) => {
      const thread = state.threads.find((t) => t.id === action.payload.id);
      if (thread) {
        thread.name = action.payload.name;
        if (action.payload.originalMessage) {
          thread.originalFirstMessage = action.payload.originalMessage;
        }
      }
    },

    updateThreadLastMessageAt: (
      state,
      action: PayloadAction<{ threadId: string; timestamp: number }>,
    ) => {
      const thread = state.threads.find((t) => t.id === action.payload.threadId);
      if (thread) thread.lastMessageAt = action.payload.timestamp;
    },

    /* -------- Bulk-load (optional) --------------------------------------- */
    loadThreads: (state, action: PayloadAction<Thread[]>) => {
      state.threads = action.payload;
      if (state.activeThreadId && !state.threads.some((t) => t.id === state.activeThreadId)) {
        state.activeThreadId = state.threads[0]?.id ?? null;
      } else if (!state.activeThreadId && state.threads.length) {
        state.activeThreadId = state.threads[0].id;
      }
    },

    /* -------- THREAD CLASSIFICATION (merged from threadClassificationsSlice) ---- */
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
      const thread = state.threads.find((t) => t.id === threadId);
      if (thread) {
        thread.scope = scope;
        thread.requiresPatient = requiresPatient;
        thread.confidence = confidence;
        thread.classifiedAt = Date.now();
        thread.isFirstQueryProcessed = true;
      }
    },

    markFirstQueryProcessed: (state, action: PayloadAction<string>) => {
      const threadId = action.payload;
      const thread = state.threads.find((t) => t.id === threadId);
      if (thread) {
        thread.isFirstQueryProcessed = true;
      }
    },

    clearThreadClassification: (state, action: PayloadAction<string>) => {
      const threadId = action.payload;
      const thread = state.threads.find((t) => t.id === threadId);
      if (thread) {
        thread.scope = undefined;
        thread.requiresPatient = undefined;
        thread.confidence = undefined;
        thread.classifiedAt = undefined;
        thread.isFirstQueryProcessed = false;
      }
    },

    /* -------- PATIENT MANAGEMENT (moved from globalStateSlice) ----------- */
    setThreadPatientId: (state, action: PayloadAction<{ threadId: string; patientId: string }>) => {
      const { threadId, patientId } = action.payload;
      const thread = state.threads.find((t) => t.id === threadId);
      if (thread) {
        thread.selectedPatientId = patientId;
      }
    },

    setThreadPatient: (state, action: PayloadAction<{ threadId: string; patient: Patient }>) => {
      const { threadId, patient } = action.payload;
      const thread = state.threads.find((t) => t.id === threadId);
      if (thread) {
        thread.selectedPatient = patient;
        thread.selectedPatientId = patient.patientId; // Keep ID in sync
      }
    },

    clearThreadPatient: (state, action: PayloadAction<string>) => {
      const threadId = action.payload;
      const thread = state.threads.find((t) => t.id === threadId);
      if (thread) {
        thread.selectedPatient = null;
        thread.selectedPatientId = null;
      }
    },

    updateThreadPatient: (
      state,
      action: PayloadAction<{ threadId: string; patient: Partial<Patient> }>,
    ) => {
      const { threadId, patient } = action.payload;
      const thread = state.threads.find((t) => t.id === threadId);
      // biome-ignore lint/complexity/useOptionalChain: ignore
      if (thread && thread.selectedPatient) {
        thread.selectedPatient = { ...thread.selectedPatient, ...patient };
      }
    },
  },
});

/* -------------------------------------------------------------------------- */
/*  Selectors                                                                 */
/* -------------------------------------------------------------------------- */

// Basic thread selectors
export const getActiveThreadId = (state: RootState) => state.threads.activeThreadId;

export const getActiveThread = (state: RootState): Thread | null => {
  const activeId = state.threads.activeThreadId;
  return activeId ? state.threads.threads.find((t) => t.id === activeId) || null : null;
};

export const getAllThreads = (state: RootState) => state.threads.threads;

export const getThreadById = (state: RootState, threadId: string): Thread | null => {
  return state.threads.threads.find((t) => t.id === threadId) || null;
};

// Thread classification selectors (merged from threadClassificationsSlice)
export const selectThreadClassification = (state: RootState, threadId: string) => {
  const thread = state.threads.threads.find((t) => t.id === threadId);
  if (!thread || !thread.scope) return null;

  return {
    threadId: thread.id,
    scope: thread.scope,
    requiresPatient: thread.requiresPatient || false,
    confidence: thread.confidence || 0,
    classifiedAt: thread.classifiedAt || 0,
    isFirstQueryProcessed: thread.isFirstQueryProcessed || false,
  };
};

export const selectIsThreadClassified = (state: RootState, threadId: string): boolean => {
  const thread = state.threads.threads.find((t) => t.id === threadId);
  return !!thread?.isFirstQueryProcessed;
};

export const selectNeedsFirstQueryEnhancement = (state: RootState, threadId: string): boolean => {
  const thread = state.threads.threads.find((t) => t.id === threadId);
  return !thread?.isFirstQueryProcessed;
};

export const selectAllClassifications = (state: RootState) => {
  const classifications: Record<string, any> = {};
  state.threads.threads.forEach((thread) => {
    if (thread.scope) {
      classifications[thread.id] = {
        threadId: thread.id,
        scope: thread.scope,
        requiresPatient: thread.requiresPatient || false,
        confidence: thread.confidence || 0,
        classifiedAt: thread.classifiedAt || 0,
        isFirstQueryProcessed: thread.isFirstQueryProcessed || false,
      };
    }
  });
  return classifications;
};

export const selectClassificationStats = (state: RootState) => {
  const threads = state.threads.threads.filter((t) => t.scope);
  return {
    total: threads.length,
    patient: threads.filter((t) => t.scope === "patient").length,
    provider: threads.filter((t) => t.scope === "provider").length,
    medspa: threads.filter((t) => t.scope === "medspa").length,
  };
};

// Patient management selectors (moved from globalStateSlice)
export const selectThreadPatientId = (state: RootState, threadId: string): string | null => {
  const thread = state.threads.threads.find((t) => t.id === threadId);
  return thread?.selectedPatientId || null;
};

export const selectThreadPatient = (state: RootState, threadId: string): Patient | null => {
  const thread = state.threads.threads.find((t) => t.id === threadId);
  return thread?.selectedPatient || null;
};

// Active thread patient selectors (convenience selectors)
export const selectActiveThreadPatientId = (state: RootState): string | null => {
  const activeThreadId = state.threads.activeThreadId;
  return activeThreadId ? selectThreadPatientId(state, activeThreadId) : null;
};

export const selectActiveThreadPatient = (state: RootState): Patient | null => {
  const activeThreadId = state.threads.activeThreadId;
  return activeThreadId ? selectThreadPatient(state, activeThreadId) : null;
};

/* -------------------------------------------------------------------------- */
/*  Exports                                                                   */
/* -------------------------------------------------------------------------- */
export const {
  // Basic thread actions
  addThread,
  deleteThread,
  setActiveThreadId,
  setActiveThread, // kept for legacy imports
  updateThreadName,
  updateThreadLastMessageAt,
  loadThreads,

  // Classification actions (merged from threadClassificationsSlice)
  setThreadClassification,
  markFirstQueryProcessed,
  clearThreadClassification,

  // Patient management actions (moved from globalStateSlice)
  setThreadPatientId,
  setThreadPatient,
  clearThreadPatient,
  updateThreadPatient,
} = threadsSlice.actions;

export default threadsSlice.reducer;
