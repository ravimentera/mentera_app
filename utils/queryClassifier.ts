// utils/queryClassifier.ts
interface QueryClassification {
  scope: "patient" | "provider" | "medspa";
  requiresPatient: boolean;
  confidence: number;
}

/**
 * Classifies a query to determine if it requires patient context
 * and what scope it belongs to (patient/provider/medspa)
 */
export const classifyQuery = (query: string, threadId?: string): QueryClassification => {
  const queryLower = query.toLowerCase().trim();

  // Patient-specific indicators (requires patient_id)
  const patientKeywords = [
    "patient history",
    "medical records",
    "treatment plan",
    "patient summary",
    "allergies",
    "medications",
    "visit notes",
    "patient data",
    "medical history",
    "patient info",
    "patient details",
    "diagnosis",
    "treatment history",
    "prescriptions",
    "patient chart",
    "vital signs",
    "lab results",
    "patient care",
    "clinical notes",
    "patient status",
    "this patient",
    "the patient",
    "patient profile",
    "health records",
  ];

  // Provider-specific indicators (no patient_id needed)
  const providerKeywords = [
    "my patients",
    "patient list",
    "my schedule",
    "list patients",
    "all patients",
    "patient roster",
    "patient directory",
    "my caseload",
    "patients assigned",
    "patient census",
    "patient overview",
    "all my patients",
    "patient queue",
  ];

  // Medspa-specific indicators (no patient_id needed)
  const medspaKeywords = [
    "all providers",
    "staff list",
    "clinic overview",
    "providers in clinic",
    "clinic staff",
    "provider directory",
    "clinic providers",
    "staff directory",
    "clinic information",
    "facility overview",
    "clinic details",
  ];

  // High confidence patient queries
  if (patientKeywords.some((keyword) => queryLower.includes(keyword))) {
    return { scope: "patient", requiresPatient: true, confidence: 0.9 };
  }

  // High confidence provider queries
  if (providerKeywords.some((keyword) => queryLower.includes(keyword))) {
    return { scope: "provider", requiresPatient: false, confidence: 0.8 };
  }

  // High confidence medspa queries
  if (medspaKeywords.some((keyword) => queryLower.includes(keyword))) {
    return { scope: "medspa", requiresPatient: false, confidence: 0.8 };
  }

  // Additional pattern matching for edge cases
  if (queryLower.includes("patient") && !queryLower.includes("patients")) {
    // Singular "patient" usually refers to specific patient
    return { scope: "patient", requiresPatient: true, confidence: 0.7 };
  }

  if (queryLower.includes("patients") && queryLower.includes("my")) {
    // "my patients" is provider scope
    return { scope: "provider", requiresPatient: false, confidence: 0.8 };
  }

  // Default to provider scope with low confidence for ambiguous queries
  return { scope: "provider", requiresPatient: false, confidence: 0.3 };
};

/**
 * Enhances a query with context for better AI responses (backend only)
 */
export const enhanceQueryWithContext = (
  query: string,
  classification: QueryClassification,
): string => {
  // Only add context hints for backend processing
  // Frontend should not see these enhancements
  const contextHints = {
    patient: "[CONTEXT: Patient-specific query requiring individual patient data]",
    provider: "[CONTEXT: Provider-level query about multiple patients or provider workflow]",
    medspa: "[CONTEXT: Medspa-level query about clinic operations or staff]",
  };

  return `${contextHints[classification.scope]} ${query}`;
};

/**
 * Determines if a query requires patient context based on keywords
 */
export const requiresPatientContext = (query: string): boolean => {
  const classification = classifyQuery(query);
  return classification.requiresPatient;
};

/**
 * Validates if patient context is properly provided for queries that need it
 */
export const validatePatientContext = (
  query: string,
  patientId?: string,
): { isValid: boolean; reason?: string } => {
  const classification = classifyQuery(query);

  if (classification.requiresPatient && !patientId) {
    return {
      isValid: false,
      reason: "Patient-specific query requires patient selection",
    };
  }

  return { isValid: true };
};

/**
 * Gets a user-friendly message for patient selection requests
 */
export const getPatientSelectionMessage = (query: string): string => {
  const messages = [
    "Sure, I can help with that. Please select a patient first.",
    "I'd be happy to help you with that patient information. Please select a patient to continue.",
    "To provide you with patient-specific information, please select a patient first.",
    "I can assist you with that. Please choose a patient to get started.",
  ];

  // Simple hash to get consistent message for same query
  const hash = query.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return messages[hash % messages.length];
};
