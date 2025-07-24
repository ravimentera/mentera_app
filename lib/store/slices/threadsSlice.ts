// store/threadsSlice.ts
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import type { RootState } from "../index";
import { clearThreadClassification } from "./threadClassificationsSlice";

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
    updateThreadName: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const thread = state.threads.find((t) => t.id === action.payload.id);
      if (thread) thread.name = action.payload.name;
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
  },
});

export const getActiveThreadId = (state: RootState) => state.threads.activeThreadId;

/* -------------------------------------------------------------------------- */
/*  Exports                                                                   */
/* -------------------------------------------------------------------------- */
export const {
  addThread,
  deleteThread,
  setActiveThreadId, // <- new export for TeraRuntimeProvider
  setActiveThread, // <- kept for legacy imports, remove when refactored
  updateThreadName,
  updateThreadLastMessageAt,
  loadThreads,
} = threadsSlice.actions;

export default threadsSlice.reducer;
