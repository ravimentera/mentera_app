/**
 * Patient Context Types
 *
 * These types define the structure for patient context data that will be
 * aggregated from multiple API sources and passed to the Bedrock agent.
 */

export interface PatientDemographics {
  patientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  allergies: string[];
  alerts: string[];
  tags: string[];
  status: string;
  communicationPreference: {
    emailOptIn: boolean;
    smsOptIn: boolean;
    pushOptIn: boolean;
    voiceOptIn: boolean;
    directMailOptIn: boolean;
  };
}

export interface PatientChart {
  id: string;
  chartId?: string;
  patientId: string;
  content: string;
  approved: boolean;
  version: number;
  chartType: string;
  treatmentType: string;
  providerIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PatientVisit {
  id: string;
  patientId: string;
  visitDate: string;
  treatmentNotesId: string;
  providerId: string;
  nextTreatment: string | null;
  followUpDate: string;
  treatment: {
    id: string;
    patientId: string;
    procedure: string;
    areasTreated: string[];
    unitsUsed: number;
    volumeUsed: string;
    observations: string;
    providerRecommendations: string;
    sessionNumber: number | null;
    isPackageSession: boolean;
    sessionPrice: string | null;
  };
  preCheck: Array<{
    id: string;
    visitId: string;
    medications: string[] | null;
    consentSigned: boolean;
    allergyCheck: string;
  }>;
  postCare: Array<{
    id: string;
    visitId: string;
    instructionsProvided: boolean;
    followUpRecommended: string;
    productsRecommended: string[];
    aftercareNotes: string | null;
  }>;
}

export interface PatientPackage {
  id: string;
  packageName: string;
  treatmentType: string;
  totalSessions: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  purchaseDate: string;
  expirationDate: string;
  packageStatus: string;
  packagePrice: string;
}

export interface PatientContext {
  patientId: string;
  demographics: PatientDemographics;
  charts: PatientChart[];
  visits: {
    enrichedVisits: PatientVisit[];
    packages: {
      totalCount: number;
      activeCount: number;
      activePackages: PatientPackage[];
    };
    appointments: {
      totalCount: number;
      upcomingAppointments: Array<{
        id: string;
        startTime: string;
        endTime: string;
        status: string;
        notes: string;
      }>;
    };
  };
  metadata: {
    sourceTimestamps: {
      demographics: string;
      charts: string;
      visits: string;
    };
    dataFreshness: string;
    contextVersion: string;
  };
}

/**
 * Provider interface for extensible data fetching
 */
export interface ContextProvider<T> {
  key: keyof PatientContext;
  fetch: (patientId: string, providerId?: string) => Promise<T>;
  transform?: (data: any) => T;
}

/**
 * Hook return interface
 */
export interface UsePatientContextResult {
  context: PatientContext | null;
  isLoading: boolean;
  isError: boolean;
  error?: any;
  refetch: () => void;
}

/**
 * Hook configuration options
 */
export interface UsePatientContextOptions {
  providerId?: string;
  enableAutoRefetch?: boolean;
  staleTime?: number;
  cacheTime?: number;
  maxCharts?: number; // Limit number of charts returned (most recent first)
}
