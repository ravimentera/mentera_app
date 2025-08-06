import { PatientStatus, PatientStatusFilter } from "@/app/constants/patient-constants";

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status?: PatientStatus;
  lastVisitDate?: string | null;
  nextAppointment?: string | null;
  tags?: string[];
  // Optional fields for backward compatibility with mock data
  provider?: string;
  visitDate?: string;
  followUpDate?: string;
  alerts?: string[];
  providerSpecialty?: string;
  treatmentOutcome?: string;
  chartId?: string;
  profile?: {
    firstName: string;
    lastName: string;
    gender: string;
    avatar?: {
      large: string;
      medium: string;
      thumbnail: string;
    };
  };
  treatmentNotes?: {
    procedure: string;
    areasTreated: string[];
    observations: string;
    providerRecommendations: string;
  };
  [key: string]: any;
}

export interface PatientsResponse {
  success?: boolean;
  data?: Patient[];
  patients?: Patient[];
  timestamp?: string;
  [key: string]: any;
}

export interface PatientsState {
  selectedPatient: Patient | null;
  searchQuery: string;
  filters: {
    status: PatientStatusFilter;
    provider?: string;
    specialty?: string;
  };
  viewMode: "table" | "grid";
  loading: boolean;
  error: string | null;
}
