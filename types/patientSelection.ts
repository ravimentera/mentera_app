// types/patientSelection.ts
export interface PendingMessage {
  text: string;
  files?: any[];
  threadId: string;
}

export interface PatientSelectionState {
  pendingMessage: PendingMessage | null;
  waitingForPatientSelection: boolean;
}

export interface PatientSelectionCallbacks {
  onPatientSelectionRequired: (message: string, files?: any[]) => void;
  handlePatientSelected: (patientId: string, patientName: string) => void;
}

export interface QueryValidationResult {
  scope: "patient" | "provider" | "medspa";
  requiresPatient: boolean;
  confidence: number;
}

export interface ValidationContext {
  activePatientId?: string;
  providerId?: string;
  medspaId?: string;
  conversationScope: "patient" | "provider" | "medspa";
  threadId: string;
}
