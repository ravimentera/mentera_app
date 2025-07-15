export interface InboxMessage {
  id: string;
  text: string;
  sender: "user" | "provider";
  timestamp: Date;
  isOutbound: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOutbound: boolean;
  channel?: string;
}

export interface ChatConversation {
  id: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  lastMessage: string;
  timestamp: Date;
  isRead: boolean;
  unreadCount: number;
  channel: "SMS" | "Email";
  messages: InboxMessage[];
}

export interface PatientDetail {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  treatmentHistory: TreatmentHistoryItem[];
  nextAppointment: NextAppointment | null;
  futureAppointments: NextAppointment[];
  medicalInsights: MedicalInsight[];
}

export interface TreatmentHistoryItem {
  id: string;
  title: string;
  date: string;
  status: "completed" | "scheduled" | "cancelled";
}

export interface NextAppointment {
  id: string;
  title: string;
  date: string;
  time: string;
  provider: string;
  status: "confirmed" | "cancelled";
}

export interface MedicalInsight {
  id: string;
  condition: string;
  reaction: string;
}

export type InboxTab = "all" | "unread" | "read";

export interface InboxCounts {
  all: number;
  unread: number;
  read: number;
}
