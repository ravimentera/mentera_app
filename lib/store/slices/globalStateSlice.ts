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
    /**
     * Sets the expanded state of the side panel.
     * @param action.payload - Boolean indicating whether the panel should be expanded.
     */
    setSidePanelExpanded: (state, action: PayloadAction<boolean>) => {
      state.isSidePanelExpanded = action.payload;
    },
    /**
     * Toggles the expanded state of the side panel.
     */
    toggleSidePanel: (state) => {
      state.isSidePanelExpanded = !state.isSidePanelExpanded;
    },
    /** select a patient by ID */
    setSelectedPatientId: (state, action: PayloadAction<string>) => {
      state.selectedPatientId = action.payload;
    },
    /** clear the current patient selection */
    clearSelectedPatientId: (state) => {
      state.selectedPatientId = null;
    },
  },
});

// Export actions - these will be dispatched from your components or other thunks
export const {
  setSidePanelExpanded,
  toggleSidePanel,
  setSelectedPatientId,
  clearSelectedPatientId,
} = globalStateSlice.actions;

// Export selectors to access the state
export const selectIsSidePanelExpanded = (state: RootState) =>
  state.globalState.isSidePanelExpanded;
export const getStreamingUISessionId = (state: RootState) => state.globalState.streamingUISessionId;
export const selectPatientDatabase = (state: RootState) => state.globalState.patientDatabase;
export const selectTestMedSpa = (state: RootState) => state.globalState.testMedSpa;
export const selectTestNurse = (state: RootState) => state.globalState.testNurse;

export const selectSelectedPatientId = (state: RootState) => state.globalState.selectedPatientId;

export const selectCurrentPatient = (state: RootState) => {
  const id = state.globalState.selectedPatientId;
  return id ? state.globalState.patientDatabase[id] : undefined;
};

// Export the reducer - this will be added to your Redux store
export default globalStateSlice.reducer;
