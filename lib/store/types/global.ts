import {
  patientDatabase as _patientDatabase,
  testMedSpa as _testMedSpa,
  testNurse as _testNurse,
} from "@/mock/chat.data";

// Define the state structure for this slice (removed patient selection properties)
export interface GlobalState {
  isSidePanelExpanded: boolean;
  isChatSidebarOpen: boolean;
  streamingUISessionId: string;

  // mock-chat data in Redux:
  patientDatabase: typeof _patientDatabase;
  testMedSpa: typeof _testMedSpa;
  testNurse: typeof _testNurse;

  // REMOVED: selectedPatientId and selectedPatient
  // These are now managed per-thread in threadsSlice
}
