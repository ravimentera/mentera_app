import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApprovalsResponse, ConversationResponse } from "../types";
import { proxyAuthBaseQuery } from "./authInterceptor";

// Types for inbox endpoint
export interface InboxLatestMessage {
  id: string;
  content: string;
  sentAt: string;
  channel: "SMS" | "Email";
  status: "QUEUED" | "DELIVERED" | "READ" | "FAILED" | "PENDING";
  direction: "OUTBOUND" | "INBOUND";
  messageType: "AI_FOLLOW_UP" | "MANUAL" | "AUTOMATED";
  isAiGenerated: boolean;
  sender: "provider" | "patient";
}

export interface InboxConversationData {
  patientId: string;
  patientName: string;
  latestMessage: InboxLatestMessage;
  messageStats: {
    totalMessages: number;
    unreadCount: number;
    lastActivity: string;
  };
  hasUnread: boolean;
  alerts: {
    hasAdverse: boolean;
    requiresFollowup: boolean;
  };
}

export interface InboxResponse {
  success: boolean;
  data: InboxConversationData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalConversations: number;
    totalUnread: number;
    adverseAlerts: number;
    followupRequired: number;
  };
}

// Types for conversation endpoint
export interface ConversationMessage {
  id: string;
  content: string;
  channel: "SMS" | "EMAIL";
  status:
    | "QUEUED"
    | "DELIVERED"
    | "READ"
    | "FAILED"
    | "PENDING"
    | "RECEIVED"
    | "APPROVED"
    | "DECLINED";
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  direction: "OUTBOUND" | "INBOUND";
  messageType: "AI_FOLLOW_UP" | "MANUAL" | "AUTOMATED" | "PATIENT_REPLY";
  isAiGenerated: boolean;
  sender: "provider" | "patient";
  senderName: string;
  createdAt: string;
  isRead: boolean;
  analytics: {
    engagementScore: number | null;
    openedAt: string | null;
    clickedAt: string | null;
    repliedAt: string | null;
  };
  queuedMessage: {
    content: string;
    approvalStatus: "PENDING_APPROVAL" | "APPROVED" | "DECLINED";
    priority: "HIGH" | "MEDIUM" | "LOW";
    generatedAt: string;
    isQueue: boolean;
    aiContext?: any;
  } | null;
  timestamp: string;
  avatar: string | null;
  messageClass: "message-sent" | "message-received";
  isPendingApproval: boolean;
  isApproved: boolean;
  isDeclined: boolean;
}

export interface ConversationData {
  providerId: string;
  patientId: string;
  patientName: string;
  messages: ConversationMessage[];
  summary: {
    totalMessages: number;
    unreadCount: number;
    firstMessage: string;
    lastMessage: string;
    aiGeneratedCount: number;
    queuedCount: number;
    pendingApprovalCount: number;
    conversationStarted: string;
  };
}

export interface DetailedConversationResponse {
  success: boolean;
  data: ConversationData;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Types for the existing provider communications endpoint
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
  message: string;
  data: {
    success: boolean;
    messageId: string;
    eventId: string;
    queuedMessage: {
      content: string;
      subject: string;
      channel: "SMS" | "EMAIL";
      priority: "HIGH" | "MEDIUM" | "LOW";
      approvalStatus: "PENDING_APPROVAL" | "APPROVED" | "DECLINED";
      aiContext: any;
      generatedAt: string;
      confidence: number;
    };
    summaries: {
      patientSummary: any;
      providerSummary: any;
      conversationSummary: any;
    };
  };
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
  baseQuery: proxyAuthBaseQuery,
  tagTypes: [
    "Approvals",
    "Conversations",
    "ProviderCommunications",
    "PatientCommunications",
    "Inbox",
  ],
  endpoints: (builder) => ({
    getProviderInbox: builder.query<
      InboxResponse,
      { providerId: string; page?: number; limit?: number }
    >({
      query: ({ providerId, page = 1, limit = 50 }) =>
        `/communication/communications/provider/${providerId}/inbox?page=${page}&limit=${limit}`,
      providesTags: ["Inbox"],
    }),
    getConversation: builder.query<
      DetailedConversationResponse,
      { providerId: string; patientId: string; page?: number; limit?: number }
    >({
      query: ({ providerId, patientId, page = 1, limit = 100 }) =>
        `/communication/communications/conversation/${providerId}/${patientId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { providerId, patientId }) => [
        { type: "Conversations", id: `${providerId}-${patientId}` },
      ],
    }),
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
  useGetProviderInboxQuery,
  useGetConversationQuery,
  useGetPendingApprovalsQuery,
  useGetPatientConversationQuery,
  useGetProviderCommunicationsQuery,
  useGetPatientCommunicationsQuery,
  useGenerateAutomatedMessageMutation,
  useDeclineApprovalMutation,
  useApproveApprovalMutation,
  useEditApproveApprovalMutation,
} = communicationsApi;
