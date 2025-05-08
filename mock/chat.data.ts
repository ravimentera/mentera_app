import { Patient } from "./types";

export const testMedSpa = {
  medspaId: "MS-1001",
  name: "Destination Aesthetics",
  location: "San Francisco",
};

export const testNurse = {
  id: "NR-2001",
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
