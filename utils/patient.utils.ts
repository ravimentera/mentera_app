import { CommunicationPreferences } from "@/app/(dashboard)/patients/[patientId]/types";
import { MedicalHistoryResponse, PatientDetailsResponse, VisitsResponse } from "@/lib/store/api";
import { getFullName } from "@/lib/utils";
import {
  Appointment,
  Campaign,
  Document,
  MedicalAlert,
  Patient,
  Treatment,
  UserHistory,
} from "../types/patient";

export function transformPatientData(patientDetails: PatientDetailsResponse): Patient {
  return {
    id: patientDetails?.data?.patientId ?? "N/A",
    firstName: patientDetails?.data?.firstName ?? "N/A",
    lastName: patientDetails?.data?.lastName ?? "N/A",
    email: patientDetails?.data?.email ?? "N/A",
    phone: patientDetails?.data?.phone ?? "N/A",
    status: (patientDetails?.data?.status as "active" | "inactive") ?? "inactive",
    tags: patientDetails?.data?.tags?.length > 0 ? patientDetails?.data?.tags : ["N/A"],
    address: {
      street: patientDetails?.data?.address ?? "N/A",
      city: patientDetails?.data?.city ?? "N/A",
      state: patientDetails?.data?.state ?? "N/A",
      zip: patientDetails?.data?.zipCode ?? "N/A",
    },
    dateOfBirth: patientDetails?.data?.dateOfBirth ?? "N/A",
    gender: patientDetails?.data?.gender ?? "N/A",
  };
}

export function transformAppointmentsData(visitsData: VisitsResponse): Appointment[] {
  return (
    visitsData?.data?.appointments?.upcomingAppointments?.map((apt) => ({
      id: apt?.id ?? "apt-" + apt.id,
      title: apt?.notes ?? "Appointment",
      date: apt?.startTime?.split("T")[0] ?? "N/A",
      time: apt?.startTime
        ? new Date(apt.startTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A",
      doctor: "N/A", // Not available in API response
      status: apt?.status?.toLowerCase() === "scheduled" ? "upcoming" : "completed",
    })) ?? []
  );
}

export function transformTreatmentsData(visitsData: VisitsResponse): Treatment[] {
  return (
    visitsData?.data?.packages?.activePackages?.map((pkg) => ({
      id: pkg?.id ?? "treatment-" + pkg.id,
      name: pkg?.packageName ?? "N/A",
      progress:
        pkg?.sessionsUsed && pkg?.totalSessions ? (pkg.sessionsUsed / pkg.totalSessions) * 100 : 0,
      totalSessions: pkg?.totalSessions ?? 0,
      completedSessions: pkg?.sessionsUsed ?? 0,
    })) ?? []
  );
}

export function transformMedicalAlertsData(
  medicalHistory: MedicalHistoryResponse,
  patientDetails: PatientDetailsResponse,
): MedicalAlert[] {
  return [
    ...(medicalHistory?.data?.conditions || []).map((condition) => ({
      id: condition?.id ?? "N/A",
      type: condition?.condition ?? "N/A",
      description: condition?.notes ?? "N/A",
      reaction: "N/A",
    })),
    ...(patientDetails?.data?.allergies || []).map((allergy: string, index: number) => ({
      id: "allergy-" + index,
      type: "Allergy: " + allergy,
      description: "N/A",
      reaction: "N/A",
    })),
  ];
}

export function transformDocumentsData(visitsData: VisitsResponse): Document[] {
  return (
    visitsData?.data?.enrichedVisits
      ?.map((visit) => ({
        id: visit?.id ?? "doc-" + visit.id,
        title: (visit?.treatment?.procedure ?? "Treatment") + " Consent Form",
        signedDate: visit?.visitDate?.split("T")[0] ?? "N/A",
        type: "consent" as const,
      }))
      .slice(0, 3) ?? []
  );
}

export function transformUserHistoryData(
  visitsData: VisitsResponse,
  patientDetails: PatientDetailsResponse,
): UserHistory {
  return {
    lastVisited: visitsData?.data?.enrichedVisits?.[0]?.visitDate?.split("T")[0] ?? "N/A",
    lastEmailConnected: patientDetails?.data?.updatedAt?.split("T")[0] ?? "N/A",
    lastSMSConnected: patientDetails?.data?.updatedAt?.split("T")[0] ?? "N/A",
    createdOn: patientDetails?.data?.createdAt?.split("T")[0] ?? "N/A",
  };
}

export function transformCampaignsData(visitsData: VisitsResponse): Campaign[] {
  return [
    {
      id: "1",
      type: "email",
      name: "Follow-up",
      date: visitsData?.data?.enrichedVisits?.[0]?.followUpDate?.split("T")[0] ?? "N/A",
    },
  ];
}

export function transformCommunicationPreferences(
  patientDetails: PatientDetailsResponse,
): CommunicationPreferences {
  return {
    emailNotifications: patientDetails?.data?.communicationPreference?.emailOptIn ?? true,
    smsReminders: patientDetails?.data?.communicationPreference?.smsOptIn ?? true,
  };
}

// Add this type definition for treatment history
export interface TreatmentHistoryItem {
  id: string;
  title: string;
  date: string;
  status: "completed" | "scheduled";
  type: string;
}

export function transformTreatmentHistoryData(visitsData: VisitsResponse): TreatmentHistoryItem[] {
  const treatments: TreatmentHistoryItem[] = [];

  // Add completed treatments from enriched visits
  visitsData?.data?.enrichedVisits?.forEach((visit) => {
    if (visit?.treatment?.procedure && visit?.visitDate) {
      const sessionNumber = visit.treatment.sessionNumber;
      const title = sessionNumber
        ? `${visit.treatment.procedure} session ${sessionNumber} completed`
        : `${visit.treatment.procedure} completed`;

      treatments.push({
        id: visit.id,
        title,
        date: visit.visitDate,
        status: "completed" as const,
        type: visit.treatment.procedure,
      });
    }

    // Add follow-up appointments if scheduled
    if (visit?.followUpDate) {
      const isFollowUpPast = new Date(visit.followUpDate) < new Date();
      treatments.push({
        id: `${visit.id}-followup`,
        title: "Follow-Up Scheduled",
        date: visit.followUpDate,
        status: isFollowUpPast ? "completed" : ("scheduled" as const),
        type: "follow-up",
      });
    }
  });

  // Add upcoming appointments
  visitsData?.data?.appointments?.upcomingAppointments?.forEach((appointment) => {
    if (appointment?.startTime) {
      treatments.push({
        id: appointment.id,
        title: appointment.notes || "Appointment Scheduled",
        date: appointment.startTime,
        status: "scheduled" as const,
        type: "appointment",
      });
    }
  });

  // Sort by date (most recent first)
  return treatments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get patient's full name from patient details
 * @param patientDetails - Patient details response
 * @returns Full name string
 */
export function getPatientFullName(patientDetails: PatientDetailsResponse): string {
  return (
    getFullName(patientDetails?.data?.firstName || "", patientDetails?.data?.lastName || "") ||
    "N/A"
  );
}
