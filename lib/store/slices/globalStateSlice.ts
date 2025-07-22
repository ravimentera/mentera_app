import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { GlobalState } from "../types";
import type { Patient } from "../types/patient";

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
  selectedPatient: null,
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
      state.selectedPatient = null; // Also clear the patient object
    },
    // NEW ACTIONS FOR PATIENT OBJECT MANAGEMENT
    setSelectedPatient: (state, action: PayloadAction<Patient>) => {
      state.selectedPatient = action.payload;
      state.selectedPatientId = action.payload.patientId; // Keep ID in sync
    },
    clearSelectedPatient: (state) => {
      state.selectedPatient = null;
      state.selectedPatientId = null;
    },
    // Update existing action to also clear patient object
    updateSelectedPatient: (state, action: PayloadAction<Partial<Patient>>) => {
      if (state.selectedPatient) {
        state.selectedPatient = { ...state.selectedPatient, ...action.payload };
      }
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
  setSelectedPatient, // NEW
  clearSelectedPatient, // NEW
  updateSelectedPatient, // NEW
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

// NEW SELECTOR FOR FULL PATIENT OBJECT
export const selectSelectedPatient = (state: RootState) => state.globalState.selectedPatient;

export const selectCurrentPatient = (state: RootState) => {
  const id = state.globalState.selectedPatientId;
  return id ? state.globalState.patientDatabase[id] : undefined;
};

// Export the reducer
export default globalStateSlice.reducer;
