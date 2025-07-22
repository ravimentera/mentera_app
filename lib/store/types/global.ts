import {
  patientDatabase as _patientDatabase,
  testMedSpa as _testMedSpa,
  testNurse as _testNurse,
} from "@/mock/chat.data";

// Define the state structure for this slice
export interface GlobalState {
  isSidePanelExpanded: boolean;
  isChatSidebarOpen: boolean;
  streamingUISessionId: string;

  // mock-chat data in Redux:
  patientDatabase: typeof _patientDatabase;
  testMedSpa: typeof _testMedSpa;
  testNurse: typeof _testNurse;

  // currently selected patient ID
  selectedPatientId: string | null;
  // currently selected patient object (for PatientSelector persistence)
  selectedPatient: any | null;
}
