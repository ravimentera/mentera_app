// utils/queryClassifier.ts
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

export interface QueryClassification {
  scope: "patient" | "provider" | "medspa";
  requiresPatient: boolean;
  confidence: number;
}

// Bedrock configuration for Nova Pro
const region = process.env.AWS_REGION || "us-east-1";
const modelId = "amazon.nova-pro-v1:0"; // Nova Pro model ID

// Environment configuration - Enable by default, disable only if explicitly set to 'false'
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const ENABLE_BEDROCK_CLASSIFICATION =
  process.env.NEXT_PUBLIC_ENABLE_BEDROCK_CLASSIFICATION !== "false";

// Additional safety check for AWS credentials/region
const hasAWSConfig = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

// Final decision on whether to use Bedrock
const USE_BEDROCK = ENABLE_BEDROCK_CLASSIFICATION && hasAWSConfig;

// Log configuration for debugging
// console.log('🔧 QUERY_CLASSIFIER_CONFIG:', {
//   IS_DEVELOPMENT,
//   ENABLE_BEDROCK_CLASSIFICATION,
//   hasAWSConfig: !!hasAWSConfig,
//   USE_BEDROCK,
//   NODE_ENV: process.env.NODE_ENV,
//   BEDROCK_ENV_VAR: process.env.NEXT_PUBLIC_ENABLE_BEDROCK_CLASSIFICATION || 'undefined',
//   AWS_REGION: region,
//   MODEL_ID: modelId
// });

const bedrockClient = new BedrockRuntimeClient({
  region: region,
});

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;
const BEDROCK_TIMEOUT_MS = 10000; // Increased timeout for foundational model

/**
 * Helper function to create delay
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper function to validate and parse JSON response from Bedrock
 */
function parseBedrockClassificationResponse(rawResponse: string): QueryClassification | null {
  try {
    // Try to extract JSON from the response
    let jsonStr = rawResponse.trim();

    // Look for JSON block in fenced code
    const fencedMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
    if (fencedMatch?.[1]) {
      jsonStr = fencedMatch[1].trim();
    }

    // Look for JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch?.[0]) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Validate the structure
    if (
      parsed &&
      typeof parsed === "object" &&
      ["patient", "provider", "medspa"].includes(parsed.scope) &&
      typeof parsed.requiresPatient === "boolean" &&
      typeof parsed.confidence === "number" &&
      parsed.confidence >= 0 &&
      parsed.confidence <= 1
    ) {
      return {
        scope: parsed.scope,
        requiresPatient: parsed.requiresPatient,
        confidence: parsed.confidence,
      };
    }

    console.warn("Invalid Bedrock classification response structure:", parsed);
    return null;
  } catch (error) {
    console.warn("Failed to parse Bedrock classification response:", error);
    return null;
  }
}

/**
 * Create comprehensive system instructions and user prompt for Nova Pro
 * Returns system and user content in Nova Pro format
 */
function createNovaProClassificationPrompt(
  query: string,
  threadId?: string,
): {
  systemInstructions: Array<{ text: string }>;
  userMessage: { role: string; content: Array<{ text: string }> };
} {
  const systemInstructions = [
    {
      text: `You are Tera, an advanced AI assistant specifically designed for medical spa (MedSpa) environments. You are an expert in healthcare workflows, medical terminology, and clinical operations.

## CORE RESPONSIBILITY
Your primary task is to classify user queries into one of three operational scopes within a MedSpa context and determine whether patient-specific context is required.

## CLASSIFICATION FRAMEWORK

### 1. PATIENT SCOPE (Requires Patient Context)
**Definition**: Queries that require access to specific individual patient data, medical records, or patient-centric information.

**Characteristics**:
- References singular patient ("the patient", "this patient", "patient's")
- Medical data specific to an individual
- Treatment plans, diagnoses, or care instructions for one person
- Individual medical history, allergies, medications
- Specific appointment details or visit notes
- Personal health information (PHI) under HIPAA

**Examples**:
- "Show me this patient's medical history"
- "What are the patient's current medications?"
- "Display the treatment plan for this patient"
- "Patient's allergy information"
- "Last visit notes for the patient"
- "Patient's vital signs from today"
- "Billing information for this patient"

**Requirements**: Always requires activePatientId to be present
**Output**: { "scope": "patient", "requiresPatient": true, "confidence": 0.8-1.0 }

### 2. PROVIDER SCOPE (No Patient Context Needed)
**Definition**: Queries about the healthcare provider's workflow, patient management, scheduling, or provider-centric operations.

**Characteristics**:
- References multiple patients ("my patients", "patient list")
- Provider workflow and scheduling
- Provider-specific statistics or performance
- Patient management and assignment operations
- Provider's calendar, appointments, or availability
- Comparative analysis across provider's caseload

**Examples**:
- "Show me my patient list"
- "What's my schedule for today?"
- "How many appointments do I have this week?"
- "My patients with upcoming appointments"
- "Patients assigned to my care"
- "My patient roster"
- "Provider performance metrics"

**Requirements**: No specific patient selection needed
**Output**: { "scope": "provider", "requiresPatient": false, "confidence": 0.7-0.9 }

### 3. MEDSPA SCOPE (No Patient Context Needed)
**Definition**: Queries about clinic-wide operations, administrative functions, all staff, or organizational-level information.

**Characteristics**:
- References entire clinic or facility
- All providers, staff, or organizational structure
- Clinic-wide statistics, reports, or analytics
- Administrative operations and compliance
- Facility management and resources
- Cross-provider or multi-departmental queries

**Examples**:
- "List all providers in the clinic"
- "Clinic overview and statistics"
- "Staff directory"
- "All patients in the system"
- "Clinic revenue reports"
- "Facility utilization metrics"
- "Compliance and audit reports"

**Requirements**: No specific patient or provider selection needed
**Output**: { "scope": "medspa", "requiresPatient": false, "confidence": 0.7-0.9 }

## CONFIDENCE SCORING GUIDELINES

**High Confidence (0.8-1.0)**:
- Clear, unambiguous indicators for the scope
- Direct medical terminology matching the category
- Explicit references ("this patient", "my patients", "all providers")

**Medium Confidence (0.6-0.8)**:
- Strong indicators but some ambiguity
- Context clues suggest the scope
- Professional medical language

**Low Confidence (0.3-0.6)**:
- Ambiguous queries that could fit multiple scopes
- Limited context or unclear intent
- General healthcare questions

**Very Low Confidence (0.1-0.3)**:
- Highly ambiguous or unclear queries
- Non-medical or off-topic questions
- Insufficient information to classify accurately

## ANALYSIS METHODOLOGY

1. **Keyword Analysis**: Identify key terms and medical terminology
2. **Context Evaluation**: Assess the operational context and workflow implications
3. **Scope Determination**: Match patterns to the three defined scopes
4. **Patient Requirement Assessment**: Determine if individual patient data is needed
5. **Confidence Calculation**: Score based on clarity and certainty of classification

## EDGE CASES AND SPECIAL CONSIDERATIONS

**Ambiguous Patient References**:
- "Patient information" → PATIENT (assumes specific patient)
- "Patient data" → PATIENT (individual focus)
- "Patient records" → PATIENT (specific records)

**Plural vs Singular Analysis**:
- "Patient" (singular) → Usually PATIENT scope
- "Patients" (plural) → Usually PROVIDER or MEDSPA scope
- "My patients" → PROVIDER scope
- "All patients" → MEDSPA scope

**Scheduling Queries**:
- "Patient's next appointment" → PATIENT (specific)
- "My schedule" → PROVIDER (provider's calendar)
- "Clinic schedule" → MEDSPA (facility-wide)

**Medical Data Queries**:
- Specific medical terms (allergies, medications, diagnosis) → PATIENT
- Aggregate medical data → PROVIDER or MEDSPA
- Clinical protocols or guidelines → MEDSPA

## OUTPUT REQUIREMENTS

You MUST respond with ONLY a valid JSON object in this exact format:
{
  "scope": "patient" | "provider" | "medspa",
  "requiresPatient": boolean,
  "confidence": number (0.0 to 1.0)
}

**Critical Instructions**:
- NO explanations, reasoning, or additional text
- NO markdown formatting or code blocks
- NO other JSON fields or properties
- Confidence must be a decimal number between 0.0 and 1.0
- Scope must be exactly one of: "patient", "provider", "medspa"
- requiresPatient must be true only for patient scope queries

## COMPLIANCE AND SECURITY

- Maintain HIPAA compliance awareness in classification
- Protect patient privacy through proper scope identification
- Ensure tenant isolation by proper scope classification
- Follow healthcare data handling best practices`,
    },
  ];

  const userMessage = {
    role: "user",
    content: [
      {
        text: `Please classify the following MedSpa query:

Query: "${query}"
Thread ID: ${threadId || "new-session"}
Timestamp: ${new Date().toISOString()}

Analyze this query according to your system instructions and respond with the required JSON format only.`,
      },
    ],
  };

  return { systemInstructions, userMessage };
}

/**
 * Bedrock Nova Pro powered query classification with fallback to keyword-based classification
 */
export const classifyQueryWithBedrock = async (
  query: string,
  threadId?: string,
): Promise<QueryClassification> => {
  // If Bedrock is disabled, use fallback immediately
  if (!USE_BEDROCK) {
    // console.log("🔄 QUERY_CLASSIFIER: Using fallback classification", {
    //   reason: !ENABLE_BEDROCK_CLASSIFICATION
    //     ? "Bedrock disabled by env var"
    //     : "Missing AWS configuration",
    //   ENABLE_BEDROCK_CLASSIFICATION,
    //   hasAWSConfig: !!hasAWSConfig,
    //   envVar: process.env.NEXT_PUBLIC_ENABLE_BEDROCK_CLASSIFICATION || "undefined",
    //   awsRegion: process.env.AWS_REGION || "undefined",
    // });
    return classifyQuery(query, threadId);
  }

  const startTime = Date.now();
  // console.log(
  //   `🚀 QUERY_CLASSIFIER: Starting Nova Pro classification for query: "${query.substring(0, 100)}..."`,
  // );
  // console.log("🔍 QUERY_CLASSIFIER: Bedrock client config:", {
  //   region,
  //   modelId,
  //   hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  //   hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
  // });

  // Try Bedrock Nova Pro classification with retries
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { systemInstructions, userMessage } = createNovaProClassificationPrompt(
        query,
        threadId,
      );

      // Nova Pro request body with correct format
      const requestBody = {
        schemaVersion: "messages-v1",
        messages: [userMessage],
        system: systemInstructions,
        inferenceConfig: {
          maxTokens: 1000,
          temperature: 0.1, // Low temperature for consistent classification
          topP: 0.9,
        },
      };

      const inputCmd: InvokeModelCommandInput = {
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(requestBody),
      };

      const command = new InvokeModelCommand(inputCmd);

      // Add timeout wrapper
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Nova Pro request timeout")), BEDROCK_TIMEOUT_MS),
      );

      const response = await Promise.race([bedrockClient.send(command), timeoutPromise]);

      if (!response.body) {
        throw new Error("Empty response from Nova Pro");
      }

      // Parse the response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      // console.log("📝 QUERY_CLASSIFIER: Raw Nova Pro response structure:", {
      //   hasOutput: !!responseBody.output,
      //   hasMessage: !!responseBody.output?.message,
      //   hasContent: !!responseBody.output?.message?.content,
      //   contentLength: responseBody.output?.message?.content?.length || 0,
      //   usage: responseBody.usage,
      // });

      if (
        !responseBody.output ||
        !responseBody.output.message ||
        !responseBody.output.message.content ||
        !responseBody.output.message.content[0] ||
        !responseBody.output.message.content[0].text
      ) {
        throw new Error("Invalid response format from Nova Pro");
      }

      const rawContent = responseBody.output.message.content[0].text;

      if (rawContent.trim() === "") {
        throw new Error("Empty content from Nova Pro");
      }

      const classification = parseBedrockClassificationResponse(rawContent);
      if (classification) {
        const duration = Date.now() - startTime;
        // console.log(
        //   `✅ QUERY_CLASSIFIER: Nova Pro classification successful in ${duration}ms (attempt ${attempt}/${MAX_RETRIES})`,
        //   {
        //     scope: classification.scope,
        //     requiresPatient: classification.requiresPatient,
        //     confidence: classification.confidence,
        //     usage: {
        //       inputTokens: responseBody.usage?.inputTokens || responseBody.usage?.input_tokens || 0,
        //       outputTokens:
        //         responseBody.usage?.outputTokens || responseBody.usage?.output_tokens || 0,
        //     },
        //   },
        // );
        return classification;
      }

      console.warn(
        `QUERY_CLASSIFIER: Invalid Nova Pro response on attempt ${attempt}/${MAX_RETRIES}:`,
        rawContent.substring(0, 200),
      );

      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS * attempt); // Exponential backoff
      }
    } catch (error: any) {
      console.error(`QUERY_CLASSIFIER: Nova Pro error on attempt ${attempt}/${MAX_RETRIES}:`, {
        message: error.message,
        name: error.name,
        code: error.code,
      });

      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS * attempt); // Exponential backoff
      }
    }
  }

  // Fallback to keyword-based classification
  const duration = Date.now() - startTime;
  console.log(`QUERY_CLASSIFIER: Falling back to keyword-based classification after ${duration}ms`);
  return classifyQuery(query, threadId);
};

/**
 * Classifies a query to determine if it requires patient context
 * and what scope it belongs to (patient/provider/medspa)
 *
 * This is the original keyword-based classification function, now used as fallback
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
