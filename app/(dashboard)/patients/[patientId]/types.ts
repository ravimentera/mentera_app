// Types for the patient profile
export interface TreatmentNotes {
  procedure: string;
  areasTreated: string[];
  unitsUsed?: number;
  volumeUsed?: string;
  sessionNumber?: number;
  sessionDuration?: string;
  cyclesCompleted?: number;
  observations: string;
  providerRecommendations: string;
}

export interface PreProcedureCheck {
  medications: string[];
  consentSigned: boolean;
  allergyCheck: string;
}

export interface PostProcedureCare {
  instructionsProvided: boolean;
  followUpRecommended: string;
  productsRecommended: string[];
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
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

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  doctor: string;
  status: "upcoming" | "completed" | "cancelled";
}

export interface Treatment {
  id: string;
  name: string;
  progress: number;
  totalSessions: number;
  completedSessions: number;
}

export interface Document {
  id: string;
  title: string;
  signedDate: string;
  type: "consent" | "medical" | "other";
}

export interface MedicalAlert {
  id: string;
  type: string;
  description: string;
  reaction: string;
}

export interface UserHistory {
  lastVisited: string;
  lastEmailConnected: string;
  lastSMSConnected: string;
  createdOn: string;
}

export interface Campaign {
  id: string;
  type: "email" | "sms";
  name: string;
  date: string;
}

export interface CommunicationPreferences {
  emailNotifications: boolean;
  smsReminders: boolean;
}
