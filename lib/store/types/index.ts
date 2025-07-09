// Patient types
export type { Patient, PatientsResponse, PatientsState } from "./patient";

// Appointment types
export type { Appointment, NotificationUpdate, StoredAppointment } from "./appointment";

// Approval types
export type { ApprovalCardData, ApprovalChatMessage, ApprovalsState } from "./approval";

// Layout types
export type {
  ApiLayoutResponse,
  DynamicLayoutState,
  LayoutComponent,
  LayoutEntry,
  LayoutGrid,
  LayoutRow,
  ThunkApiConfig,
} from "./layout";

// User types
export type { UserRole, UserRoleState } from "./user";

// Global state types
export type { GlobalState } from "./global";

// Auth types
export type { AuthState, LoginCredentials, LoginResponse, TokenResponse } from "./auth";

// Communication Types
export interface CommunicationMessage {
  id: string;
  content: string;
  timestamp: string;
  direction: "INBOUND" | "OUTBOUND";
  sender: {
    id: string;
    name: string;
    type: "patient" | "provider";
    phone: string;
  };
  channel: "SMS" | "EMAIL";
  status: "PENDING" | "APPROVED" | "DECLINED" | "QUEUED" | "RECEIVED" | "READ";
  deliveredAt: string | null;
  readAt: string | null;
  metadata: {
    messageType: string;
    isAiGenerated: boolean;
    originalMessageId?: string;
  };
  engagement: {
    score: number | null;
    openedAt: string | null;
    clickedAt: string | null;
    repliedAt: string | null;
  };
}

export interface ConversationSummary {
  conversationId: string;
  summary: {
    summary: string;
    keyTopics: string[];
    patientConcerns: string[];
    providerActions: string[];
    followUpRequired: boolean;
    tone: string;
    riskLevel: string;
  };
  analytics: {
    totalMessages: number;
    patientMessages: number;
    providerMessages: number;
    conversationSpan: {
      start: string;
      end: string;
      durationHours: number;
    };
    channels: string[];
    responseTime: number;
    lastActivity: string;
  };
  enhancedAnalytics: {
    engagement: {
      deliveryRate: number;
      readRate: number;
    };
    messagesByHour: Record<string, number>;
    sentimentAnalysis: {
      overall: string;
      confidence: number;
      details: {
        positiveIndicators: number;
        negativeIndicators: number;
        ratio: number;
      };
    };
  };
  metadata: {
    generatedAt: string;
    summaryType: string;
    messageCount: number;
    dateRange: {
      from: string;
      to: string;
    };
  };
}

export interface ConversationData {
  conversation: {
    patientId: string;
    participants: {
      patient: {
        name: string;
        phone: string;
      };
      provider: {
        id: string;
        name: string;
        phone: string;
        role: string;
      };
    };
    totalMessages: number;
    unreadCount: number;
    lastActivity: string;
    channels: string[];
  };
  messages: CommunicationMessage[];
  queuedMessage: CommunicationMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ConversationResponse {
  success: boolean;
  data: {
    summary: ConversationSummary;
    conversation: ConversationData;
  };
}

export interface ApprovalItem {
  id: string;
  eventId: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  communication: {
    type: string;
    channel: "SMS" | "EMAIL";
    content: string;
    subject: string;
    generatedAt: string;
    confidence: number;
  };
  context: {
    aiContext: {
      eventType: string;
      generatedAt: string;
      eventMetadata: Record<string, any>;
      medspaContext: {
        id: string;
        name: string;
        protocols: {
          followUpWindow: string;
          urgentResponseTime: string;
        };
        preferences: {
          responseTime: string;
          allowAIGeneration: boolean;
          communicationTone: string;
        };
      };
      triggerSource: string;
      patientContext: {
        name: string;
        summary: string;
        keyPoints: string[];
        preferences: Record<string, any>;
        demographics: Record<string, any>;
        recentFeedback: any[];
      };
      providerContext: {
        name: string;
        summary: string;
        specialty: string;
        preferences: {
          notificationPreferences: Record<string, any>;
        };
        communicationStyle: {
          tone: string;
          style: string;
          formality: string;
          usesEmojis: boolean;
          avgMessageLength: number;
          preferredChannel: string;
          preferredLanguage: string;
        };
      };
      conversationContext: {
        summary: string;
        sentiment: string;
        actionItems: string[];
        unreadCount: number;
        messageCount: number;
        recentTopics: string[];
      };
    };
    patientConcerns: string[];
  };
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING_APPROVAL" | "APPROVED" | "DECLINED";
  createdAt: string;
}

export interface ApprovalsResponse {
  success: boolean;
  data: {
    approvals: ApprovalItem[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}
