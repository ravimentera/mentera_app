// utils/responseValidator.ts
import { getPatientSelectionMessage, requiresPatientContext } from "./queryClassifier";

interface ValidationContext {
  activePatientId?: string;
  providerId?: string;
  medspaId?: string;
  conversationScope: "patient" | "provider" | "medspa";
  threadId: string;
}

interface ValidationResult {
  isValid: boolean;
  shouldOverride: boolean;
  overrideResponse?: {
    action: "REQUEST_PATIENT_SELECTION";
    message: string;
  };
}

/**
 * Final safety net - validates responses to ensure 100% compliance
 */
export const validateResponse = (
  response: any,
  context: ValidationContext,
  originalQuery: string,
): ValidationResult => {
  const requiresPatient = requiresPatientContext(originalQuery);
  const hasPatientId = !!context.activePatientId;

  // Check if this should have been blocked but wasn't
  if (requiresPatient && !hasPatientId) {
    console.log("RESPONSE_VALIDATOR: Enforcing patient context compliance", {
      query: originalQuery.substring(0, 50) + "...",
      hasPatientId,
      threadId: context.threadId,
    });

    return {
      isValid: false,
      shouldOverride: true,
      overrideResponse: {
        action: "REQUEST_PATIENT_SELECTION",
        message: getPatientSelectionMessage(originalQuery),
      },
    };
  }

  return {
    isValid: true,
    shouldOverride: false,
  };
};

/**
 * Middleware function to wrap any chat response with validation
 */
export const withResponseValidation = (originalQuery: string, context: ValidationContext) => {
  return (response: any) => {
    const validation = validateResponse(response, context, originalQuery);

    if (validation.shouldOverride) {
      console.log("RESPONSE_VALIDATOR: Overriding response for compliance");
      return validation.overrideResponse;
    }

    return response;
  };
};

/**
 * Logs validation events for monitoring and debugging
 */
export const logValidationEvent = (
  event: "BLOCKED" | "ALLOWED" | "OVERRIDE",
  query: string,
  context: ValidationContext,
  reason?: string,
) => {
  console.log(`VALIDATION_${event}:`, {
    timestamp: new Date().toISOString(),
    query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
    hasPatientId: !!context.activePatientId,
    scope: context.conversationScope,
    threadId: context.threadId,
    reason,
  });
};
