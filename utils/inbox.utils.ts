import type { ChatConversation, InboxCounts, InboxMessage } from "@/app/(dashboard)/inbox/types";
import type { CommunicationMessage } from "@/lib/store/api/communicationsApi";
import { getInitials } from "@/lib/utils";

/**
 * Transform API communication messages to inbox conversations
 */
export function transformCommunicationsToConversations(
  communications: CommunicationMessage[],
): ChatConversation[] {
  // Group messages by patient
  const conversationGroups = communications.reduce(
    (groups, comm) => {
      if (!groups[comm.patientId]) {
        groups[comm.patientId] = [];
      }
      groups[comm.patientId].push(comm);
      return groups;
    },
    {} as Record<string, CommunicationMessage[]>,
  );

  // Transform each group into a conversation
  return Object.entries(conversationGroups).map(([patientId, messages]) => {
    // Sort messages by date (newest first for lastMessage, but we'll reverse for the messages array)
    const sortedMessages = [...messages].sort(
      // Create a copy to avoid mutating the original array
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
    );

    const latestMessage = sortedMessages[0];
    const patientName =
      latestMessage.metadata?.patientName ||
      latestMessage.metadata?.participantInfo?.patientName ||
      "Unknown Patient";

    // Count unread messages (status is not "READ")
    const unreadCount = messages.filter((msg) => msg.status !== "READ").length;

    // Transform messages to inbox format (showing only first few for conversation list)
    const transformedMessages: InboxMessage[] = sortedMessages
      .slice(0, 10) // Limit to last 10 messages for performance in conversation list
      .map(transformMessageToInboxMessage)
      .reverse(); // Reverse to show oldest first in conversation

    return {
      id: `conv-${patientId}`,
      patientId: patientId,
      patientName: patientName,
      patientInitials: getInitials(patientName),
      lastMessage: latestMessage.content,
      timestamp: new Date(latestMessage.sentAt),
      isRead: unreadCount === 0,
      unreadCount: unreadCount,
      channel: latestMessage.channel === "SMS" ? ("SMS" as const) : ("Email" as const),
      messages: transformedMessages,
    };
  });
}

/**
 * Transform patient-specific communications to complete conversation messages
 * This is used when a conversation is selected to show all messages
 */
export function transformPatientCommunicationsToMessages(
  communications: CommunicationMessage[],
): InboxMessage[] {
  return [...communications] // Create a copy to avoid mutating the original array
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()) // Oldest first
    .map(transformMessageToInboxMessage);
}

/**
 * Update a conversation with complete message history from patient communications
 */
export function updateConversationWithCompleteMessages(
  conversation: ChatConversation,
  patientCommunications: CommunicationMessage[],
): ChatConversation {
  const completeMessages = transformPatientCommunicationsToMessages(patientCommunications);

  return {
    ...conversation,
    messages: completeMessages,
  };
}

/**
 * Transform a single communication message to inbox message format
 */
function transformMessageToInboxMessage(comm: CommunicationMessage): InboxMessage {
  // Determine if this is from patient or provider based on metadata
  const isFromPatient =
    comm.metadata?.isPatientReply === true || comm.metadata?.direction === "INBOUND";

  // Handle special cases for pending/queued messages
  let displayContent = comm.content;
  if (comm.content === "AI-generated message pending approval" && comm.status === "QUEUED") {
    displayContent = `[${comm.metadata?.messageType || "Message"} - Pending Approval]`;
  }

  return {
    id: comm.id,
    text: displayContent,
    sender: isFromPatient ? "user" : "provider",
    timestamp: new Date(comm.sentAt),
    isOutbound: !isFromPatient,
  };
}

/**
 * Calculate inbox counts from conversations
 */
export function calculateInboxCounts(conversations: ChatConversation[]): InboxCounts {
  const all = conversations.length;
  const unread = conversations.filter((conv) => !conv.isRead).length;
  const read = conversations.filter((conv) => conv.isRead).length;

  return { all, unread, read };
}
