export interface Patient {
  patientId: string;
  chartId: string;
  visitDate: string;
  provider: string;
  treatmentNotes: {
    procedure: string;
    areasTreated: string[];
    observations: string;
    providerRecommendations: string;
    [key: string]: any;
  };
  preProcedureCheck: {
    medications: string[];
    consentSigned: boolean;
    allergyCheck: string;
  };
  postProcedureCare: {
    instructionsProvided: boolean;
    followUpRecommended: string;
    productsRecommended: string[];
  };
  nextTreatment: string;
  followUpDate: string;
  alerts: string[];
  providerSpecialty: string;
  treatmentOutcome: string;
}

export interface PatientFilters {
  status?: "Active" | "Inactive" | "All";
  specialty?: string;
  procedure?: string;
}
