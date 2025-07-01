import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { GlobalState } from "../types";

import {
  patientDatabase as _patientDatabase,
  testMedSpa as _testMedSpa,
  testNurse as _testNurse,
} from "@/mock/chat.data";

// Define the initial state
const initialState: GlobalState = {
  isSidePanelExpanded: false,
  isChatSidebarOpen: true, // <-- NEW STATE
  streamingUISessionId: crypto.randomUUID(),

  patientDatabase: _patientDatabase,
  testMedSpa: _testMedSpa,
  testNurse: _testNurse,

  selectedPatientId: null,
};

// Create the slice
export const globalStateSlice = createSlice({
  name: "globalState",
  initialState,
  reducers: {
    setSidePanelExpanded: (state, action: PayloadAction<boolean>) => {
      state.isSidePanelExpanded = action.payload;
    },
    toggleSidePanel: (state) => {
      state.isSidePanelExpanded = !state.isSidePanelExpanded;
    },
    setIsChatSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isChatSidebarOpen = action.payload;
    },
    setSelectedPatientId: (state, action: PayloadAction<string>) => {
      state.selectedPatientId = action.payload;
    },
    clearSelectedPatientId: (state) => {
      state.selectedPatientId = null;
    },
  },
});

// Export actions
export const {
  setSidePanelExpanded,
  toggleSidePanel,
  setIsChatSidebarOpen, // <-- NEW ACTION
  setSelectedPatientId,
  clearSelectedPatientId,
} = globalStateSlice.actions;

// Export selectors
export const selectIsSidePanelExpanded = (state: RootState) =>
  state.globalState.isSidePanelExpanded;
export const selectIsChatSidebarOpen = (state: RootState) => state.globalState.isChatSidebarOpen; // <-- NEW SELECTOR
export const getStreamingUISessionId = (state: RootState) => state.globalState.streamingUISessionId;
export const selectPatientDatabase = (state: RootState) => state.globalState.patientDatabase;
export const selectTestMedSpa = (state: RootState) => state.globalState.testMedSpa;
export const selectTestNurse = (state: RootState) => state.globalState.testNurse;

export const selectSelectedPatientId = (state: RootState) => state.globalState.selectedPatientId;

export const selectCurrentPatient = (state: RootState) => {
  const id = state.globalState.selectedPatientId;
  return id ? state.globalState.patientDatabase[id] : undefined;
};

// Export the reducer
export default globalStateSlice.reducer;
