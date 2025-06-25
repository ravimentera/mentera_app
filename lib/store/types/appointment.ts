// Component-facing Appointment type (dates are Date objects)
export interface Appointment {
  id: string;
  patientId: string;
  chartId: string;
  patient: {
    firstName: string;
    lastName: string;
    condition?: string;
  };
  provider: {
    providerId: string;
    firstName: string;
    lastName: string;
    specialties: string[];
  };
  startTime: Date; // Strictly Date
  endTime: Date; // Strictly Date
  status: "scheduled" | "completed" | "cancelled" | "pending";
  notes?: string;
  location?: string;
  type: "therapy" | "consultation" | "followup" | "general";
  notificationStatus?: {
    status: "pending" | "approved" | "disapproved";
    sent: boolean;
    message?: string;
    type: "pre-care" | "post-care";
    editedMessage?: string;
  };
  chatHistory?: {
    id: string;
    text: string;
    sender: string;
    timestamp: Date; // Strictly Date
    isOutbound: boolean;
  }[];
}

// Internal type for Redux store (dates are ISO strings for serializability)
export interface StoredAppointment {
  id: string;
  patientId: string;
  chartId: string;
  patient: {
    firstName: string;
    lastName: string;
    condition?: string;
  };
  provider: {
    providerId: string;
    firstName: string;
    lastName: string;
    specialties: string[];
  };
  startTime: string; // Stored as ISO string
  endTime: string; // Stored as ISO string
  status: "scheduled" | "completed" | "cancelled" | "pending";
  notes?: string;
  type: "therapy" | "consultation" | "followup" | "general";
  notificationStatus?: {
    status: "pending" | "approved" | "disapproved";
    sent: boolean;
    message?: string;
    type: "pre-care" | "post-care";
    editedMessage?: string;
  };
  chatHistory?: {
    id: string;
    text: string;
    sender: string;
    timestamp: string; // Stored as ISO string
    isOutbound: boolean;
  }[];
}

export interface NotificationUpdate {
  appointmentId: string;
  status: "pending" | "approved" | "disapproved";
  sent: boolean;
  editedMessage?: string;
}
