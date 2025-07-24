import {
  classifyQuery,
  getPatientSelectionMessage,
  requiresPatientContext,
} from "@/utils/queryClassifier";
import { enhanceQueryWithContext, shouldEnhanceQuery } from "@/utils/queryEnhancer";
// app/api/queryClassifier/route.ts
import { NextRequest, NextResponse } from "next/server";

interface QueryClassificationRequest {
  text: string;
  threadId: string;
  sessionAttributes: {
    activePatientId?: string;
    providerId?: string;
    medspaId?: string;
    conversationScope?: "patient" | "provider" | "medspa";
    threadId: string;
  };
  existingMessages?: any[];
  files?: any[];
}

interface QueryClassificationResponse {
  action?: "REQUEST_PATIENT_SELECTION" | "PROCEED";
  message?: string;
  classification: {
    scope: "patient" | "provider" | "medspa";
    requiresPatient: boolean;
    confidence: number;
  };
  enhancedQuery?: string;
  shouldEnhance: boolean;
}

/**
 * API Route for Query Classification and Enhancement
 * Handles server-side query validation and context enhancement
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<QueryClassificationResponse>> {
  try {
    const {
      text,
      threadId,
      sessionAttributes,
      existingMessages = [],
      files,
    }: QueryClassificationRequest = await request.json();

    console.log("API_QUERY_CLASSIFIER: Processing request", {
      text: text.substring(0, 100) + "...",
      hasPatientId: !!sessionAttributes.activePatientId,
      threadId: threadId.substring(0, 8) + "...",
    });

    // Step 1: Classify the query
    const classification = classifyQuery(text, threadId);

    // Step 2: Check if query enhancement should be applied (first message only)
    const shouldEnhance = shouldEnhanceQuery(threadId, existingMessages);

    // Step 3: Server-side validation - check if patient context is required
    if (classification.requiresPatient && !sessionAttributes.activePatientId) {
      console.log("API_QUERY_CLASSIFIER: Blocking patient query without patient_id");

      return NextResponse.json({
        action: "REQUEST_PATIENT_SELECTION",
        message: getPatientSelectionMessage(text),
        classification,
        shouldEnhance: false,
      });
    }

    // Step 4: Enhance query if this is the first message
    let enhancedQuery: string | undefined;
    if (shouldEnhance) {
      enhancedQuery = enhanceQueryWithContext({
        originalQuery: text,
        classification,
        providerId: sessionAttributes.providerId,
        medspaId: sessionAttributes.medspaId,
        patientId: sessionAttributes.activePatientId,
      });

      console.log("API_QUERY_CLASSIFIER: Enhanced first message", {
        originalLength: text.length,
        enhancedLength: enhancedQuery.length,
        scope: classification.scope,
      });
    }

    // Step 5: Return successful classification
    console.log("API_QUERY_CLASSIFIER: Query validated and classified", {
      scope: classification.scope,
      requiresPatient: classification.requiresPatient,
      enhanced: shouldEnhance,
    });

    return NextResponse.json({
      action: "PROCEED",
      classification,
      enhancedQuery,
      shouldEnhance,
    });
  } catch (error) {
    console.error("API_QUERY_CLASSIFIER: Error processing request", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        classification: { scope: "provider", requiresPatient: false, confidence: 0 },
        shouldEnhance: false,
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint for testing query classification
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testQuery = searchParams.get("q") || "Show patient history";

  const classification = classifyQuery(testQuery);

  return NextResponse.json({
    query: testQuery,
    classification,
    requiresPatient: requiresPatientContext(testQuery),
    timestamp: new Date().toISOString(),
  });
}
