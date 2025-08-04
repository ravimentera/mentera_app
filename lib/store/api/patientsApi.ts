import { createApi } from "@reduxjs/toolkit/query/react";
import { proxyAuthBaseQuery } from "./authInterceptor";

interface Patient {
  id: string;
  patientId: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
  status: string;
  lastVisitDate: string | null;
  nextAppointment: string | null;
}

interface PatientsResponse {
  success: boolean;
  data: Patient[];
  message?: string;
}

// New types for patient details API
export interface PatientDetailsResponse {
  success: boolean;
  data: {
    id: string;
    patientId: string;
    chartId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    allergies: string[];
    alerts: string[];
    tags: string[];
    providerIds: string[];
    status: string;
    medspaId: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    createdAt: string;
    updatedAt: string;
    communicationPreference: {
      emailOptIn: boolean;
      smsOptIn: boolean;
      pushOptIn: boolean;
      voiceOptIn: boolean;
      directMailOptIn: boolean;
    };
    preferredChannels?: {
      communication?: "SMS" | "EMAIL" | "PUSH" | "VOICE";
      marketing?: "SMS" | "EMAIL" | "PUSH" | "VOICE";
    };
  };
  timestamp: string;
}

// Types for medical history API
export interface MedicalHistoryResponse {
  success: boolean;
  data: {
    patientId: string;
    conditions: Array<{
      id: string;
      condition: string;
      diagnosedDate: string;
      notes: string;
      medspaId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    visitHistory: VisitsResponse["data"];
  };
  timestamp: string;
}

// Types for visits API
export interface VisitsResponse {
  success: boolean;
  data: {
    enrichedVisits: Array<{
      id: string;
      patientId: string;
      visitDate: string;
      treatmentNotesId: string;
      providerId: string;
      nextTreatment: string | null;
      followUpDate: string;
      medspaId: string;
      createdAt: string;
      updatedAt: string;
      treatment: {
        id: string;
        patientId: string;
        procedure: string;
        areasTreated: string[];
        unitsUsed: number;
        volumeUsed: string;
        observations: string;
        providerRecommendations: string;
        medspaId: string;
        packageId: string;
        sessionNumber: number | null;
        isPackageSession: boolean;
        sessionPrice: string | null;
        createdAt: string;
        updatedAt: string;
        package: {
          id: string;
          patientId: string;
          serviceId: string;
          medspaId: string;
          packageName: string;
          treatmentType: string;
          totalSessions: number;
          sessionsUsed: number;
          sessionsRemaining: number;
          purchaseDate: string;
          expirationDate: string;
          packageStatus: string;
          packagePrice: string;
          notes: string;
          createdAt: string;
          updatedAt: string;
        };
      };
      preCheck: Array<{
        id: string;
        visitId: string;
        medications: string[] | null;
        consentSigned: boolean;
        allergyCheck: string;
        medspaId: string;
        createdAt: string;
        updatedAt: string;
      }>;
      postCare: Array<{
        id: string;
        visitId: string;
        instructionsProvided: boolean;
        followUpRecommended: string;
        productsRecommended: string[];
        aftercareNotes: string | null;
        medspaId: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>;
    packages: {
      totalCount: number;
      inactiveCount: number;
      activeCount: number;
      activePackages: Array<{
        id: string;
        patientId: string;
        serviceId: string;
        medspaId: string;
        packageName: string;
        treatmentType: string;
        totalSessions: number;
        sessionsUsed: number;
        sessionsRemaining: number;
        purchaseDate: string;
        expirationDate: string;
        packageStatus: string;
        packagePrice: string;
        notes: string;
        createdAt: string;
        updatedAt: string;
      }>;
      inactivePackages: any[];
    };
    appointments: {
      totalCount: number;
      upcomingAppointments: Array<{
        id: string;
        medspaId: string;
        patientId: string;
        serviceId: string | null;
        startTime: string;
        endTime: string;
        status: string;
        notes: string;
        createdAt: string;
        updatedAt: string;
      }>;
    };
  };
  timestamp: string;
}

// Types for health insights API
export interface HealthInsightsResponse {
  success: boolean;
  data: {
    patientId: string;
    insights: {
      healthPatterns: string[];
      preventativeSuggestions: string[];
      lifestyleRecommendations: string[];
      treatmentOptimizationIdeas: string[];
      overallSummary: string;
    };
    dataQuality: {
      aiResponseType: string;
      confidence: string;
      lastUpdated: string;
    };
    timestamp: string;
  };
  timestamp: string;
}

export const patientsApi = createApi({
  reducerPath: "patientsApi",
  baseQuery: proxyAuthBaseQuery,
  endpoints: (builder) => ({
    getPatientsByProvider: builder.query<Patient[], string>({
      query: (providerId) => `/patients?providerId=${providerId}`,
      transformResponse: (response: PatientsResponse) => response.data,
    }),
    getPatientDetails: builder.query<PatientDetailsResponse, string>({
      query: (patientId) => `/patients/${patientId}`,
    }),
    getPatientMedicalHistory: builder.query<MedicalHistoryResponse, string>({
      query: (patientId) => `/patients/${patientId}/medical-history`,
    }),
    getPatientVisits: builder.query<VisitsResponse, string>({
      query: (patientId) => `/patients/medical/patients/${patientId}/visits`,
    }),
    getHealthInsights: builder.query<HealthInsightsResponse, string>({
      query: (patientId) => `/patients/intelligence/patients/${patientId}/health-insights/latest`,
    }),
    createHealthInsights: builder.mutation<HealthInsightsResponse, string>({
      query: (patientId) => ({
        url: `/patients/intelligence/patients/${patientId}/health-insights`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetPatientsByProviderQuery,
  useGetPatientDetailsQuery,
  useGetPatientMedicalHistoryQuery,
  useGetPatientVisitsQuery,
  useGetHealthInsightsQuery,
  useCreateHealthInsightsMutation,
} = patientsApi;
