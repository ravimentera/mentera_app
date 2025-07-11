"use client";

import { PatientOverview } from "@/components/organisms/approvals";
import { ChatPanel, ConversationList } from "@/components/organisms/inbox";
import {
  useGetPatientCommunicationsQuery,
  useGetProviderCommunicationsQuery,
} from "@/lib/store/api/communicationsApi";
import {
  calculateInboxCounts,
  transformCommunicationsToConversations,
  updateConversationWithCompleteMessages,
} from "@/utils/inbox.utils";
import { useEffect, useMemo, useState } from "react";
import type { ChatConversation, InboxCounts } from "./types";

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [conversationWithCompleteMessages, setConversationWithCompleteMessages] =
    useState<ChatConversation | null>(null);

  // Use hardcoded provider ID for now - in real app this would come from auth context
  const providerId = "PR-2001";

  // Fetch communications data using RTK Query
  const {
    data: communicationsResponse,
    isLoading,
    error,
  } = useGetProviderCommunicationsQuery({ providerId });

  // Fetch complete patient communications when a conversation is selected
  const {
    data: patientCommunicationsResponse,
    isLoading: isLoadingPatientMessages,
    error: patientMessagesError,
  } = useGetPatientCommunicationsQuery(
    { patientId: selectedConversation?.patientId || "" },
    { skip: !selectedConversation?.patientId },
  );

  // Transform API data to match existing interface
  const conversations = useMemo(() => {
    if (!communicationsResponse?.data?.data) return [];
    return transformCommunicationsToConversations(communicationsResponse.data.data);
  }, [communicationsResponse]);

  // Update selected conversation with complete messages when patient data is loaded
  useEffect(() => {
    if (selectedConversation && patientCommunicationsResponse?.data) {
      const updatedConversation = updateConversationWithCompleteMessages(
        selectedConversation,
        patientCommunicationsResponse.data,
      );
      setConversationWithCompleteMessages(updatedConversation);
    } else {
      setConversationWithCompleteMessages(selectedConversation);
    }
  }, [selectedConversation, patientCommunicationsResponse]);

  // Calculate counts for tabs
  const counts = useMemo((): InboxCounts => {
    return calculateInboxCounts(conversations);
  }, [conversations]);

  const handleConversationSelect = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    // Clear previous complete messages while new ones load
    setConversationWithCompleteMessages(conversation);

    // Mark as read when selected
    if (!conversation.isRead) {
      conversation.isRead = true;
      conversation.unreadCount = 0;
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
          {isLoadingPatientMessages && selectedConversation ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-500">Loading complete conversation...</div>
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
          className="w-[320px] bg-white"
        />
      ) : (
        <div className="w-[320px] bg-white p-6">
          <div className="text-center text-gray-500">
            <p>Select a conversation to view patient details</p>
          </div>
        </div>
      )}
    </div>
  );
}
