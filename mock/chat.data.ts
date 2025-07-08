import { patients } from "./patients.data";
import { Patient } from "./types";

export const testMedSpa = {
  medspaId: "MS-1001",
  name: "Destination Aesthetics",
  location: "San Francisco",
};

export const testNurse = {
  id: "PR-2001",
  email: "rachel.garcia@medspa.com",
  role: "PROVIDER",
  firstName: "Rachel",
  lastName: "Garcia",
  specialties: ["Botox", "Dermal Fillers"],
  medspaId: testMedSpa.medspaId,
};

export const patientDatabase: Record<string, Patient> = {
  "PT-1003": {
    id: "PT-1003",
    chartId: "CH-5003",
    treatmentNotes: {
      procedure: "Laser Hair Removal",
      areasTreated: ["Underarms"],
      unitsUsed: null,
      sessionNumber: 3,
      observations:
        "No adverse reactions. Patient reported 80% reduction in hair growth, high satisfaction with results.",
      providerRecommendations:
        "Continue with remaining sessions as planned; assess after session 5 for potential maintenance treatments.",
    },
    preProcedureCheck: {
      medications: ["None"],
      consentSigned: true,
      allergyCheck: "Latex allergy confirmed, precautions taken",
    },
    postProcedureCare: {
      instructionsProvided: true,
      followUpRecommended: "2025-03-27",
      productsRecommended: ["Aloe Vera Gel"],
    },
    nextTreatment: "Laser Hair Removal session 4",
    followUpDate: "2025-03-27",
    alerts: ["Latex allergy"],
    medspaId: testMedSpa.medspaId,
    providerSpecialty: "Laser Hair Removal",
    treatmentOutcome: "Positive",
  },
  "PT-1004": {
    id: "PT-1004",
    chartId: "CH-5004",
    treatmentNotes: {
      procedure: "Chemical Peel",
      areasTreated: ["Face"],
      unitsUsed: null,
      sessionNumber: 2,
      observations:
        "Mild redness post-procedure. Patient showing good progress with acne scarring reduction.",
      providerRecommendations: "Continue series of 6 treatments as planned.",
    },
    preProcedureCheck: {
      medications: ["Tretinoin - discontinued 1 week prior"],
      consentSigned: true,
      allergyCheck: "No known allergies",
    },
    postProcedureCare: {
      instructionsProvided: true,
      followUpRecommended: "2025-04-15",
      productsRecommended: ["Gentle Cleanser", "SPF 50"],
    },
    nextTreatment: "Chemical Peel session 3",
    followUpDate: "2025-04-15",
    alerts: ["Avoid sun exposure"],
    medspaId: testMedSpa.medspaId,
    providerSpecialty: "Chemical Peels",
    treatmentOutcome: "Positive",
  },
};

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOutbound: boolean;
}

export interface ChatData {
  id: string;
  name: string;
  assignee: string;
  channel: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  patientName: string;
  messages: Message[];
}

// Generate mock chat data from patients data
export const chatData: ChatData[] = patients.map((patient) => ({
  id: patient.patientId,
  name: patient.provider,
  assignee: patient.provider,
  channel: "SMS",
  message: patient.treatmentNotes.observations.slice(0, 50) + "...",
  timestamp: new Date(patient.visitDate),
  isRead: Math.random() > 0.5, // Random read status for demo
  patientName: patient.patientId.includes("PT-")
    ? `${patient.patientId.split("-")[1]}`
    : patient.patientId,
  messages: [
    {
      id: "1",
      text: `Hi ${patient.provider.split(" ")[0]}, just checking in—how's your treatment going?`,
      sender: "provider",
      timestamp: new Date(patient.visitDate),
      isOutbound: false,
    },
    {
      id: "2",
      text: patient.treatmentNotes.observations,
      sender: "patient",
      timestamp: new Date(new Date(patient.visitDate).getTime() + 1000 * 60 * 30), // 30 mins later
      isOutbound: true,
    },
    {
      id: "3",
      text: patient.treatmentNotes.providerRecommendations,
      sender: "provider",
      timestamp: new Date(new Date(patient.visitDate).getTime() + 1000 * 60 * 60), // 1 hour later
      isOutbound: false,
    },
    {
      id: "4",
      text: "Thank you for the recommendations! I'll make sure to follow them.",
      sender: "patient",
      timestamp: new Date(new Date(patient.visitDate).getTime() + 1000 * 60 * 90), // 1.5 hours later
      isOutbound: true,
    },
  ],
}));
