"use client";

import {
  Appointment,
  Campaign,
  CommunicationPreferences,
  Document,
  MedicalAlert,
  Patient,
  Treatment,
  UserHistory,
} from "./types";

/**
 * Generate a complete patient profile with extended data beyond what's in the mock
 * to meet the Figma design requirements
 */
export function getPatientProfile(): {
  patient: Patient;
  appointments: Appointment[];
  packages: Treatment[];
  documents: Document[];
  medicalAlerts: MedicalAlert[];
  userHistory: UserHistory;
  campaigns: Campaign[];
  communicationPreferences: CommunicationPreferences;
} {
  const patient: Patient = {
    id: "1005",
    firstName: "Olivia",
    lastName: "Parker",
    email: "michel@johnsonmed.com",
    phone: "(655) 124-5458",
    status: "inactive",
    tags: ["VIP", "Botox"],
    address: {
      street: "1901 Thornridge Cir. Shiloh",
      city: "Hawaii",
      state: "HI",
      zip: "81063",
    },
    dateOfBirth: "2000-03-05",
    gender: "Female",
  };

  const appointments: Appointment[] = [
    {
      id: "1",
      title: "Botox Treatment",
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      time: "2:00 PM",
      doctor: "Dr. Sarah Wilson",
      status: "upcoming",
    },
    {
      id: "2",
      title: "Lip Treatment",
      date: "2025-05-06",
      time: "2:00 PM",
      doctor: "Dr. Sarah Wilson",
      status: "upcoming",
    },
  ];

  const packages: Treatment[] = [
    {
      id: "1",
      name: "Botox Package",
      progress: 50,
      totalSessions: 6,
      completedSessions: 3,
    },
    {
      id: "2",
      name: "Facelift Package",
      progress: 37.5,
      totalSessions: 8,
      completedSessions: 3,
    },
  ];

  const documents: Document[] = [
    {
      id: "1",
      title: "Treatment Consent Form",
      signedDate: "2025-03-01",
      type: "consent",
    },
    {
      id: "2",
      title: "Treatment Consent Form",
      signedDate: "2025-03-01",
      type: "consent",
    },
  ];

  const medicalAlerts: MedicalAlert[] = [
    {
      id: "1",
      type: "Allergies to Amfearmone",
      description: "Allergies to Amfearmone",
      reaction: "Fever",
    },
    {
      id: "2",
      type: "Allergies to Paracitamole",
      description: "Allergies to Paracitamole",
      reaction: "Breathing issue, Rashes",
    },
  ];

  const userHistory: UserHistory = {
    lastVisited: "2025-03-03",
    lastEmailConnected: "2025-03-03",
    lastSMSConnected: "2025-03-03",
    createdOn: "2025-03-03",
  };

  const campaigns: Campaign[] = [
    {
      id: "1",
      type: "email",
      name: "Follow - Up",
      date: "2025-03-03",
    },
    {
      id: "2",
      type: "sms",
      name: "New Year Offer",
      date: "2025-03-03",
    },
  ];

  const communicationPreferences: CommunicationPreferences = {
    emailNotifications: true,
    smsReminders: false,
  };

  return {
    patient,
    appointments,
    packages,
    documents,
    medicalAlerts,
    userHistory,
    campaigns,
    communicationPreferences,
  };
}
