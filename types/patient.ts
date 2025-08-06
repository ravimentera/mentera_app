import { PatientStatus } from "@/app/constants/patient-constants";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: PatientStatus;
  tags: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  dateOfBirth: string;
  gender: string;
}

export interface PatientDetails {
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
  };
  timestamp: string;
}

export interface PatientMedicalHistory {
  conditions: Array<{
    id: string;
    condition: string;
    notes: string;
  }>;
}

export interface PatientVisits {
  appointments: {
    upcomingAppointments: Array<{
      id: string;
      notes: string;
      startTime: string;
      status: string;
    }>;
  };
  packages: {
    activePackages: Array<{
      id: string;
      packageName: string;
      sessionsUsed: number;
      totalSessions: number;
    }>;
  };
  enrichedVisits: Array<{
    id: string;
    visitDate: string;
    followUpDate: string;
    treatment: {
      procedure: string;
    };
  }>;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  doctor: string;
  status: "upcoming" | "completed";
}

export interface Treatment {
  id: string;
  name: string;
  progress: number;
  totalSessions: number;
  completedSessions: number;
}

export interface MedicalAlert {
  id: string;
  type: string;
  description: string;
  reaction: string;
}

export interface Document {
  id: string;
  title: string;
  signedDate: string;
  type: "consent";
}

export interface UserHistory {
  lastVisited: string;
  lastEmailConnected: string;
  lastSMSConnected: string;
  createdOn: string;
}

export interface Campaign {
  id: string;
  type: "email";
  name: string;
  date: string;
}
