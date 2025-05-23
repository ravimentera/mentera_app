// lib/store/globalStateSlice.ts
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "./index";

// bring in your mock data once, here:
import {
  patientDatabase as _patientDatabase,
  testMedSpa as _testMedSpa,
  testNurse as _testNurse,
} from "@/mock/chat.data";

export interface GlobalState {
  isSidePanelExpanded: boolean;
  streamingUISessionId: string;

  // mock-chat data in Redux:
  patientDatabase: typeof _patientDatabase;
  testMedSpa: typeof _testMedSpa;
  testNurse: typeof _testNurse;

  // currently selected patient ID
  selectedPatientId: string | null;
}

const initialState: GlobalState = {
  isSidePanelExpanded: false,
  streamingUISessionId: crypto.randomUUID(),

  // seed the mock data into state:
  patientDatabase: _patientDatabase,
  testMedSpa: _testMedSpa,
  testNurse: _testNurse,

  selectedPatientId: null,
};

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

export const {
  setSidePanelExpanded,
  toggleSidePanel,
  setSelectedPatientId,
  clearSelectedPatientId,
} = globalStateSlice.actions;

// selectors
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

export default globalStateSlice.reducer;
