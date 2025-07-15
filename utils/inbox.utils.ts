import type { ChatConversation, InboxCounts, InboxMessage } from "@/app/(dashboard)/inbox/types";
import type {
  ConversationData,
  ConversationMessage,
  InboxConversationData,
} from "@/lib/store/api/communicationsApi";
import { getInitials } from "@/lib/utils";

/**
 * Transform inbox conversation data to chat conversations for the UI
 */
export function transformInboxDataToConversations(
  inboxData: InboxConversationData[],
): ChatConversation[] {
  return inboxData.map((data) => {
    const { patientId, patientName, latestMessage, messageStats, hasUnread } = data;

    // Create a single message object for the conversation list
    const lastMessageObj: InboxMessage = {
      id: latestMessage.id,
      text: latestMessage.content,
      sender: latestMessage.sender === "provider" ? "provider" : "user",
      timestamp: new Date(latestMessage.sentAt),
      isOutbound: latestMessage.direction === "OUTBOUND",
    };

    return {
      id: `conv-${patientId}`,
      patientId: patientId,
      patientName: patientName,
      patientInitials: getInitials(patientName),
      lastMessage: latestMessage.content,
      timestamp: new Date(latestMessage.sentAt),
      isRead: !hasUnread,
      unreadCount: messageStats.unreadCount,
      channel: latestMessage.channel === "SMS" ? ("SMS" as const) : ("Email" as const),
      messages: [lastMessageObj], // Only latest message for conversation list
    };
  });
}

/**
 * Transform detailed conversation data to inbox messages for chat display
 */
export function transformConversationToMessages(
  conversationData: ConversationData,
): InboxMessage[] {
  return conversationData.messages
    .map((message) => transformConversationMessageToInboxMessage(message))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Sort oldest first
}

/**
 * Transform a single conversation message to inbox message format
 */
function transformConversationMessageToInboxMessage(message: ConversationMessage): InboxMessage {
  // Handle special cases for pending/queued messages
  let displayContent = message.content;
  if (message.content === "AI-generated message pending approval" && message.queuedMessage) {
    displayContent = message.queuedMessage.content;
  }

  return {
    id: message.id,
    text: displayContent,
    sender: message.sender === "provider" ? "provider" : "user",
    timestamp: new Date(message.sentAt),
    isOutbound: message.direction === "OUTBOUND",
  };
}

/**
 * Update conversation with detailed messages from conversation API
 */
export function updateConversationWithDetailedMessages(
  conversation: ChatConversation,
  conversationData: ConversationData,
): ChatConversation {
  const detailedMessages = transformConversationToMessages(conversationData);

  return {
    ...conversation,
    messages: detailedMessages,
    patientName: conversationData.patientName || conversation.patientName,
  };
}

/**
 * Calculate inbox counts from inbox data
 */
export function calculateInboxCountsFromData(inboxData: InboxConversationData[]): InboxCounts {
  const all = inboxData.length;
  const unread = inboxData.filter((data) => data.hasUnread).length;
  const read = inboxData.filter((data) => !data.hasUnread).length;

  return { all, unread, read };
}
