import { createApi } from "@reduxjs/toolkit/query/react";
import { proxyAuthBaseQuery } from "./authInterceptor";

// Request types
export interface StartTranscriptionRequest {
  patientId: string;
  chartType: "prechart" | "postchart";
}

export interface GenerateSOAPRequest {
  templateId: string;
  treatmentId: string;
  aiOptions: {
    tone: "professional" | "casual" | "detailed";
    detail: "standard" | "detailed" | "brief";
  };
}

// Response types
export interface StartTranscriptionResponse {
  success: boolean;
  data: {
    sessionId: string;
    transcriptionEndpoint: string;
    status: string;
    language: string;
    sampleRate: number;
    encoding: string;
  };
}

export interface StopTranscriptionResponse {
  success: boolean;
  data: {
    sessionId: string;
    finalTranscript: string;
    duration: number;
    audioFileUrl?: string;
    wordCount: number;
  };
}

export interface GenerateSOAPResponse {
  success: boolean;
  data: {
    soapSections: {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
    };
    chartId: string;
    generatedAt: string;
  };
}

export const transcriptionApi = createApi({
  reducerPath: "transcriptionApi",
  baseQuery: proxyAuthBaseQuery,
  tagTypes: ["Transcription"],
  endpoints: (builder) => ({
    startTranscription: builder.mutation<StartTranscriptionResponse, StartTranscriptionRequest>({
      query: (body) => ({
        url: "/providers/charts/transcription/start",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transcription"],
    }),
    stopTranscription: builder.mutation<StopTranscriptionResponse, string>({
      query: (sessionId) => ({
        url: `/providers/charts/transcription/${sessionId}/stop`,
        method: "POST",
      }),
      invalidatesTags: ["Transcription"],
    }),
    generateSOAP: builder.mutation<
      GenerateSOAPResponse,
      { sessionId: string; body: GenerateSOAPRequest }
    >({
      query: ({ sessionId, body }) => ({
        url: `/providers/charts/transcription/${sessionId}/generate-soap`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transcription"],
    }),
  }),
});

export const {
  useStartTranscriptionMutation,
  useStopTranscriptionMutation,
  useGenerateSOAPMutation,
} = transcriptionApi;
