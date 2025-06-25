// Define the Message type for chat history within an approval card
export interface ApprovalChatMessage {
  id: string;
  text: string;
  sender: string; // "user", "provider", "patient", "ai" etc.
  timestamp: string; // ISO string for serializability
  isOutbound: boolean;
}

// Define the structure for an individual approval card item
export interface ApprovalCardData {
  id: string; // Corresponds to Appointment ID
  appointmentId: string; // Explicitly keep appointment ID
  patientName: string;
  patientId: string;
  isVip: boolean;
  time: string; // Formatted time string e.g., "Today, 10:00 AM"
  subject: string;
  message: string; // The current message to be sent/approved
  originalMessage: string; // The original message from notificationStatus
  notificationType: "pre-care" | "post-care";
  aiGeneratedMessage?: string; // AI's suggested alternative
  chatHistory?: ApprovalChatMessage[];
  // UI-specific state for this card, managed if not local to ApprovalCard.tsx
  messageVariant?: number; // 0 for original/current, 1 for AI, 2+ for alternatives
  showTeraCompose?: boolean;
  editedMessage?: string; // If user edits the message directly in the approval card
}

// Define the state structure for this slice
export interface ApprovalsState {
  items: ApprovalCardData[];
  currentCardIndex: number;
  isLoading: boolean; // For fetching initial approvals if it were async
  error: string | null;
}
