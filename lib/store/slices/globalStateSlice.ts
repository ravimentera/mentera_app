import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { GlobalState } from "../types";

import {
  patientDatabase as _patientDatabase,
  testMedSpa as _testMedSpa,
  testNurse as _testNurse,
} from "@/mock/chat.data";

// Define the initial state (removed patient selection properties)
const initialState: GlobalState = {
  isSidePanelExpanded: false,
  isChatSidebarOpen: true,
  streamingUISessionId: crypto.randomUUID(),

  patientDatabase: _patientDatabase,
  testMedSpa: _testMedSpa,
  testNurse: _testNurse,

  // REMOVED: selectedPatientId and selectedPatient
  // These are now managed per-thread in threadsSlice
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

    // REMOVED: All patient selection actions
    // setSelectedPatientId, clearSelectedPatientId, setSelectedPatient,
    // clearSelectedPatient, updateSelectedPatient
    // These are now handled in threadsSlice
  },
});

// Export actions (removed patient selection actions)
export const { setSidePanelExpanded, toggleSidePanel, setIsChatSidebarOpen } =
  globalStateSlice.actions;

// Export selectors (removed patient selection selectors)
export const selectIsSidePanelExpanded = (state: RootState) =>
  state.globalState.isSidePanelExpanded;
export const selectIsChatSidebarOpen = (state: RootState) => state.globalState.isChatSidebarOpen;
export const getStreamingUISessionId = (state: RootState) => state.globalState.streamingUISessionId;
export const selectPatientDatabase = (state: RootState) => state.globalState.patientDatabase;
export const selectTestMedSpa = (state: RootState) => state.globalState.testMedSpa;
export const selectTestNurse = (state: RootState) => state.globalState.testNurse;

// REMOVED: Patient selection selectors
// selectSelectedPatientId, selectSelectedPatient, selectCurrentPatient
// These are now available as selectActiveThreadPatientId, selectActiveThreadPatient in threadsSlice

// Export the reducer
export default globalStateSlice.reducer;
