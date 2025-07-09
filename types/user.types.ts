export interface Avatar {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  gender: string; // Changed from "male" | "female" to string for more flexibility
  avatar: Avatar;
}

export interface ProviderAvatar {
  avatar: Avatar;
}

// Extended patient interface with profile - now more comprehensive to handle approval components
export interface PatientWithProfile {
  patientId: string;
  profile: UserProfile;
  chartId: string;
  visitDate: string;
  provider: string;
  treatmentNotes: {
    procedure: string;
    areasTreated: string[];
    unitsUsed?: number | null;
    volumeUsed?: string;
    sessionNumber?: number;
    sessionDuration?: string;
    cyclesCompleted?: number;
    needleDepth?: string;
    peelType?: string;
    settings?: string;
    technology?: string;
    pigmentUsed?: string;
    observations: string;
    providerRecommendations: string;
    [key: string]: any; // Allow for flexible additional properties
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

// Extended provider interface with avatar
export interface ProviderWithAvatar {
  providerId: string;
  avatar: Avatar;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  specialties: string[];
  assignedPatients: {
    patientId: string;
    chartId: string;
  }[];
  schedule: {
    nextAppointment: string;
    availability: string[];
  };
}
