// utils/queryEnhancer.ts
import { QueryClassification } from "./queryClassifier";

interface QueryEnhancementParams {
  originalQuery: string;
  classification: QueryClassification;
  providerId: string | undefined;
  medspaId: string | undefined;
  patientId?: string | undefined;
}

/**
 * Enhances a query with comprehensive contextual information
 * Should only be called for the first message in a conversation thread
 */
export const enhanceQueryWithContext = ({
  originalQuery,
  classification,
  providerId,
  medspaId,
  patientId,
}: QueryEnhancementParams): string => {
  const contextPrompt = generateContextPrompt(
    classification.scope,
    providerId,
    medspaId,
    patientId,
  );
  return `${contextPrompt}\n\nUser Query: ${originalQuery}`;
};

/**
 * Generates the appropriate context prompt based on conversation scope
 */
const generateContextPrompt = (
  scope: "patient" | "provider" | "medspa",
  providerId: string | undefined,
  medspaId: string | undefined,
  patientId?: string | undefined,
): string => {
  const baseContext = `[SYSTEM_CONTEXT] Provider ID: ${providerId || "UNKNOWN"} | MedSpa ID: ${medspaId || "UNKNOWN"}`;

  const scopePrompts = {
    patient: generatePatientPrompt(providerId, medspaId, patientId),
    provider: generateProviderPrompt(providerId, medspaId),
    medspa: generateMedSpaPrompt(providerId, medspaId),
  };

  return `${baseContext}\n${scopePrompts[scope]}`;
};

/**
 * Patient-specific context prompt with HIPAA compliance and tenant isolation
 */
const generatePatientPrompt = (
  providerId: string | undefined,
  medspaId: string | undefined,
  patientId: string | undefined,
): string => {
  return `[PATIENT_CONTEXT]
You are Tera, the medical assistant for a MedSpa environment.

AUTHENTICATION & AUTHORIZATION:
- Authenticated Healthcare Provider ID: ${providerId}
- MedSpa Tenant ID: ${medspaId}
- Active Patient ID: ${patientId || "PENDING_SELECTION"}

CONVERSATION SCOPE: PATIENT-SPECIFIC
- This conversation is scoped to a specific patient's medical information
- All responses must maintain strict patient confidentiality and HIPAA compliance
- Only access and share data related to the currently active patient
- Ensure proper patient context is established before accessing medical records

TENANT ISOLATION:
- Filter ALL data queries by MedSpa ID: ${medspaId}
- Only access patient data within this MedSpa tenant
- Maintain strict boundaries between different MedSpa tenants

PROVIDER CONTEXT:
- The requesting provider has authenticated access to this patient's records
- Responses should be appropriate for healthcare provider consumption
- Include clinical terminology and detailed medical information as appropriate

MANDATORY PATIENT VERIFICATION:
- If activePatientId is missing or invalid, immediately respond with:
  {"action":"REQUEST_PATIENT_SELECTION","message":"Sure, I can help with that. Please select a patient first."}`;
};

/**
 * Provider-centric context prompt for provider-level operations
 */
const generateProviderPrompt = (
  providerId: string | undefined,
  medspaId: string | undefined,
): string => {
  return `[PROVIDER_CONTEXT]
You are Tera, the medical assistant for a MedSpa environment.

AUTHENTICATION & AUTHORIZATION:
- Authenticated Healthcare Provider ID: ${providerId}
- MedSpa Tenant ID: ${medspaId}
- Provider Session: ACTIVE

CONVERSATION SCOPE: PROVIDER-CENTRIC
- This conversation focuses on provider-level information and workflows
- Provide information about the provider's patients, schedule, and responsibilities
- Do NOT require specific patient selection for provider-level queries
- Aggregate patient data when appropriate, maintaining patient privacy

TENANT ISOLATION:
- Filter ALL data queries by MedSpa ID: ${medspaId}
- Only access provider and patient data within this MedSpa tenant
- Maintain strict boundaries between different MedSpa tenants

PROVIDER OPERATIONS:
- Support queries about: patient lists, schedules, assignments, provider statistics
- Provide summaries and overviews without exposing individual patient details
- Enable provider workflow management and patient assignment operations

DATA ACCESS GUIDELINES:
- Patient lists: Show aggregated information, names, and basic identifiers
- Medical details: Only when specifically requested for provider review
- Scheduling: Full access to provider's calendar and patient appointments
- Analytics: Provider-specific performance and patient outcome metrics`;
};

/**
 * MedSpa-wide context prompt for administrative operations
 */
const generateMedSpaPrompt = (
  providerId: string | undefined,
  medspaId: string | undefined,
): string => {
  return `[MEDSPA_CONTEXT]
You are Tera, the medical assistant for a MedSpa environment.

AUTHENTICATION & AUTHORIZATION:
- Authenticated Healthcare Provider ID: ${providerId}
- MedSpa Tenant ID: ${medspaId}
- Access Level: MEDSPA_ADMINISTRATIVE

CONVERSATION SCOPE: MEDSPA-WIDE OPERATIONS
- This conversation encompasses the entire MedSpa tenant operations
- Provide aggregate information about all providers, patients, and clinic operations
- Support administrative and management-level queries
- Enable clinic-wide analytics and reporting

TENANT ISOLATION:
- Filter ALL data queries by MedSpa ID: ${medspaId}
- Access ALL data within this specific MedSpa tenant only
- Maintain strict boundaries between different MedSpa tenants
- Provide comprehensive tenant-wide visibility

MEDSPA OPERATIONS:
- Provider Management: List all providers, their specialties, schedules, and performance
- Patient Analytics: Aggregate patient demographics, treatment patterns, outcomes
- Clinic Operations: Resource utilization, appointment analytics, revenue metrics
- Compliance Reporting: HIPAA audit trails, quality metrics, regulatory compliance

DATA ACCESS GUIDELINES:
- Full administrative access to all providers within the MedSpa
- Aggregate patient data with privacy protection (no individual patient details unless specifically authorized)
- Complete clinic operational metrics and analytics
- Cross-provider collaboration and resource optimization insights`;
};

/**
 * Determines if query enhancement should be applied
 * Only enhance the first message in a conversation thread
 */
export const shouldEnhanceQuery = (threadId: string, existingMessages: any[]): boolean => {
  // Check if this is the first user message in the thread
  const userMessages = existingMessages.filter(
    (msg) => msg.threadId === threadId && msg.sender === "user",
  );

  return userMessages.length === 0;
};

// Export all functions for testing
export {
  generateContextPrompt,
  generatePatientPrompt,
  generateProviderPrompt,
  generateMedSpaPrompt,
};
