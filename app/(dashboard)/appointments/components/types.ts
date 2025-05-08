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
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  type: "therapy" | "consultation" | "followup" | "general";
  notificationStatus?: {
    status: "pending" | "approved" | "disapproved";
    sent: boolean;
    message?: string;
    type: "pre-care" | "post-care";
    editedMessage?: string;
  };
}
