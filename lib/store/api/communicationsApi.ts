import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";
import type { ApprovalsResponse, ConversationResponse } from "../types";

// Types for the new provider communications endpoint
export interface CommunicationMessage {
  id: string;
  patientId: string;
  providerId: string;
  medspaId: string;
  channel: "SMS" | "EMAIL" | "PUSH";
  content: string;
  status:
    | "RECEIVED"
    | "READ"
    | "DELIVERED"
    | "FAILED"
    | "QUEUED"
    | "APPROVED"
    | "DECLINED"
    | "PENDING";
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  eventId: string | null;
  notificationId: string | null;
  metadata: {
    messageType?: string;
    originalMessageId?: string;
    direction?: string;
    source?: string;
    patientName?: string;
    createdBy?: string;
    isPatientReply?: boolean;
    aiGenerated?: boolean;
    approvalRequired?: boolean;
    tone?: string;
    format?: string;
    aiModel?: string;
    aiPrompt?: string;
    generatedAt?: string;
    contextDataProvided?: boolean;
    patientInfoProvided?: boolean;
    treatmentInfoProvided?: boolean;
    participantInfo?: {
      patientName: string;
      nurseName: string;
      nursePhone: string;
      patientPhone: string;
    };
    treatment?: string;
    areasTreated?: string[];
    appointment?: {
      id: string;
      date: string;
      time: string;
      provider: string;
      location: string;
    };
    campaign?: string;
    discount?: number;
    expires?: string;
  } | null;
  engagementData: {
    clicks: number;
    openCount: number;
    responseTime: number | null;
    responseText: string | null;
    linkClicked?: string;
  } | null;
  createdAt: string;
  eventType: string | null;
  engagementScore: number | null;
  openedAt: string | null;
  clickedAt: string | null;
  repliedAt: string | null;
}

export interface ProviderCommunicationsResponse {
  success: boolean;
  data: {
    data: CommunicationMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface PatientCommunicationsResponse {
  success: boolean;
  data: CommunicationMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Types for automated message generation
export interface GenerateAutomatedMessageRequest {
  patientId: string;
  providerId: string;
  eventType: string;
  channel: "SMS" | "EMAIL";
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface GenerateAutomatedMessageResponse {
  success: boolean;
  data: {
    messageId: string;
    content: string;
    channel: "SMS" | "EMAIL";
    patientId: string;
    providerId: string;
    eventType: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    generatedAt: string;
    metadata: {
      aiGenerated: boolean;
      aiModel: string;
      tone: string;
      format: string;
      contextDataProvided: boolean;
      patientInfoProvided: boolean;
      treatmentInfoProvided: boolean;
    };
    requiresApproval: boolean;
    confidence: number;
  };
  timestamp: string;
}

// Types for approval actions
export interface DeclineApprovalResponse {
  success: boolean;
  data: {
    approvalId: string;
    status: "DECLINED";
    declinedAt: string;
    declinedBy: string;
  };
  message: string;
  timestamp: string;
}

export interface ApproveApprovalResponse {
  success: boolean;
  data: {
    approvalId: string;
    status: "APPROVED";
    approvedAt: string;
    approvedBy: string;
    sentAt?: string;
    messageId?: string;
  };
  message: string;
  timestamp: string;
}

// Types for edit-approve action
export interface EditApproveApprovalRequest {
  content: string;
  scheduledFor?: string;
}

export interface EditApproveApprovalResponse {
  success: boolean;
  data: {
    approvalId: string;
    status: "APPROVED";
    approvedAt: string;
    approvedBy: string;
    content: string;
    scheduledFor?: string;
    sentAt?: string;
    messageId?: string;
  };
  message: string;
  timestamp: string;
}

export const communicationsApi = createApi({
  reducerPath: "communicationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/proxy",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token || localStorage.getItem("auth_token");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      // Add required headers for Next.js API routes
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
      headers.set("x-medspa-id", "MS-1001");

      return headers;
    },
    credentials: "include", // This ensures cookies are sent with requests
  }),
  tagTypes: ["Approvals", "Conversations", "ProviderCommunications", "PatientCommunications"],
  endpoints: (builder) => ({
    getPendingApprovals: builder.query<
      ApprovalsResponse,
      { providerId: string; limit?: number; offset?: number }
    >({
      query: ({ providerId, limit = 50, offset = 0 }) =>
        `/communication/approvals/pending/${providerId}?limit=${limit}&offset=${offset}`,
      providesTags: ["Approvals"],
    }),
    getPatientConversation: builder.query<
      ConversationResponse,
      { patientId: string; providerId: string }
    >({
      query: ({ patientId, providerId }) =>
        `/communication/communications/patient/${patientId}/conversation?providerId=${providerId}`,
      providesTags: ["Conversations"],
    }),
    getProviderCommunications: builder.query<
      ProviderCommunicationsResponse,
      { providerId: string; page?: number; limit?: number }
    >({
      query: ({ providerId, page = 1, limit = 50 }) =>
        `/communication/communications/provider/${providerId}?page=${page}&limit=${limit}`,
      providesTags: ["ProviderCommunications"],
    }),
    getPatientCommunications: builder.query<
      PatientCommunicationsResponse,
      { patientId: string; page?: number; limit?: number }
    >({
      query: ({ patientId, page = 1, limit = 50 }) =>
        `/communication/communications/patient/${patientId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { patientId }) => [
        { type: "PatientCommunications", id: patientId },
      ],
    }),
    generateAutomatedMessage: builder.mutation<
      GenerateAutomatedMessageResponse,
      GenerateAutomatedMessageRequest
    >({
      query: (body) => ({
        url: "/communication/automated-messages/generate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Approvals", "ProviderCommunications"],
    }),
    declineApproval: builder.mutation<DeclineApprovalResponse, { approvalId: string }>({
      query: ({ approvalId }) => ({
        url: `/communication/approvals/decline/${approvalId}`,
        method: "POST",
      }),
      invalidatesTags: ["Approvals", "ProviderCommunications"],
    }),
    approveApproval: builder.mutation<ApproveApprovalResponse, { approvalId: string }>({
      query: ({ approvalId }) => ({
        url: `/communication/approvals/approve/${approvalId}`,
        method: "POST",
      }),
      invalidatesTags: ["Approvals", "ProviderCommunications"],
    }),
    editApproveApproval: builder.mutation<
      EditApproveApprovalResponse,
      { approvalId: string; body: EditApproveApprovalRequest }
    >({
      query: ({ approvalId, body }) => ({
        url: `/communication/approvals/edit-approve/${approvalId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Approvals", "ProviderCommunications"],
    }),
  }),
});

export const {
  useGetPendingApprovalsQuery,
  useGetPatientConversationQuery,
  useGetProviderCommunicationsQuery,
  useGetPatientCommunicationsQuery,
  useGenerateAutomatedMessageMutation,
  useDeclineApprovalMutation,
  useApproveApprovalMutation,
  useEditApproveApprovalMutation,
} = communicationsApi;
