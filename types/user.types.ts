export interface Avatar {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  avatar: Avatar;
}

export interface ProviderAvatar {
  avatar: Avatar;
}

// Extended patient interface with profile
export interface PatientWithProfile {
  patientId: string;
  profile: UserProfile;
  chartId: string;
  visitDate: string;
  provider: string;
  treatmentNotes: {
    procedure: string;
    areasTreated: string[];
    unitsUsed?: number;
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
