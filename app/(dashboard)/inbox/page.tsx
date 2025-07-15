"use client";

import { PatientOverview } from "@/components/organisms/approvals";
import { ChatPanel, ConversationList } from "@/components/organisms/inbox";
import {
  useGetConversationQuery,
  useGetProviderInboxQuery,
} from "@/lib/store/api/communicationsApi";
import {
  transformInboxDataToConversations,
  updateConversationWithDetailedMessages,
} from "@/utils/inbox.utils";
import { useEffect, useMemo, useState } from "react";
import type { ChatConversation, InboxCounts } from "./types";

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [conversationWithCompleteMessages, setConversationWithCompleteMessages] =
    useState<ChatConversation | null>(null);
  // Track read status changes locally to update filters immediately
  const [readStatusUpdates, setReadStatusUpdates] = useState<Record<string, boolean>>({});

  // Use hardcoded provider ID for now - in real app this would come from auth context
  const providerId = "PR-2001";

  // Fetch inbox data using the new inbox endpoint
  const { data: inboxResponse, isLoading, error } = useGetProviderInboxQuery({ providerId });

  // Fetch detailed conversation when a conversation is selected
  const {
    data: conversationResponse,
    isLoading: isLoadingConversation,
    error: conversationError,
  } = useGetConversationQuery(
    {
      providerId: providerId,
      patientId: selectedConversation?.patientId || "",
    },
    { skip: !selectedConversation?.patientId },
  );

  // Transform inbox data to match existing interface and apply local read status updates
  const conversations = useMemo(() => {
    if (!inboxResponse?.data) return [];
    const baseConversations = transformInboxDataToConversations(inboxResponse.data);

    // Apply local read status updates
    return baseConversations.map((conversation) => {
      const localReadStatus = readStatusUpdates[conversation.id];
      if (localReadStatus !== undefined) {
        return {
          ...conversation,
          isRead: localReadStatus,
          unreadCount: localReadStatus ? 0 : conversation.unreadCount,
        };
      }
      return conversation;
    });
  }, [inboxResponse, readStatusUpdates]);

  // Update selected conversation with detailed messages when conversation data is loaded
  useEffect(() => {
    if (selectedConversation && conversationResponse?.data) {
      const updatedConversation = updateConversationWithDetailedMessages(
        selectedConversation,
        conversationResponse.data,
      );
      setConversationWithCompleteMessages(updatedConversation);
    } else {
      setConversationWithCompleteMessages(selectedConversation);
    }
  }, [selectedConversation, conversationResponse]);

  // Calculate counts for tabs using the current conversations (with local updates applied)
  const counts = useMemo((): InboxCounts => {
    const all = conversations.length;
    const unread = conversations.filter((conv) => !conv.isRead).length;
    const read = conversations.filter((conv) => conv.isRead).length;
    return { all, unread, read };
  }, [conversations]);

  const handleConversationSelect = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    // Clear previous complete messages while new ones load
    setConversationWithCompleteMessages(conversation);

    // Mark as read when selected (if it wasn't already read)
    if (!conversation.isRead) {
      setReadStatusUpdates((prev) => ({
        ...prev,
        [conversation.id]: true,
      }));
    }
  };

  const handleSendMessage = (messageText: string) => {
    if (!conversationWithCompleteMessages) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      text: messageText,
      sender: "provider" as const,
      timestamp: new Date(),
      isOutbound: true,
    };

    const updatedConversation = {
      ...conversationWithCompleteMessages,
      messages: [...conversationWithCompleteMessages.messages, newMessage],
      lastMessage: messageText,
      timestamp: new Date(),
    };

    setConversationWithCompleteMessages(updatedConversation);

    // Also update the selected conversation for consistency
    if (selectedConversation) {
      setSelectedConversation({
        ...selectedConversation,
        lastMessage: messageText,
        timestamp: new Date(),
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full flex bg-gray-50 items-center justify-center">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full flex bg-gray-50 items-center justify-center">
        <div className="text-red-500">Error loading conversations. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onConversationSelect={handleConversationSelect}
        counts={counts}
      />
      <div className="py-4 px-0 flex-1 h-screen bg-white">
        <div className="rounded-2xl border border-gray-200 h-full">
          {isLoadingConversation && selectedConversation ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-500">Loading conversation...</div>
            </div>
          ) : (
            <ChatPanel
              conversation={conversationWithCompleteMessages}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
      </div>

      {selectedConversation ? (
        <PatientOverview
          patientId={selectedConversation.patientId}
          className="w-[360px] bg-white"
        />
      ) : (
        <div className="w-[360px] bg-white p-6">
          <div className="text-center text-gray-500">
            <p>Select a conversation to view patient details</p>
          </div>
        </div>
      )}
    </div>
  );
}
