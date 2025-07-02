"use client";

import { ChatPanel, ConversationList, PatientDetailsSidebar } from "@/components/organisms/inbox";
import { mockConversations, mockPatientDetails } from "@/mock/inbox.data";
import { useMemo, useState } from "react";
import type { ChatConversation, InboxCounts, PatientDetail } from "./types";

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);

  // Calculate counts for tabs
  const counts = useMemo((): InboxCounts => {
    const all = mockConversations.length;
    const unread = mockConversations.filter((c) => !c.isRead).length;
    const read = mockConversations.filter((c) => c.isRead).length;
    return { all, unread, read };
  }, []);

  // Get patient details for selected conversation
  const selectedPatient: PatientDetail | null = useMemo(() => {
    if (!selectedConversation) return null;
    return mockPatientDetails[selectedConversation.patientId] || null;
  }, [selectedConversation]);

  const handleConversationSelect = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    // Mark as read when selected
    if (!conversation.isRead) {
      conversation.isRead = true;
      conversation.unreadCount = 0;
    }
  };

  const handleSendMessage = (messageText: string) => {
    if (!selectedConversation) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      text: messageText,
      sender: "provider" as const,
      timestamp: new Date(),
      isOutbound: true,
    };

    selectedConversation.messages.push(newMessage);
    selectedConversation.lastMessage = messageText;
    selectedConversation.timestamp = new Date();

    // Update state to trigger re-render
    setSelectedConversation({ ...selectedConversation });
  };

  return (
    <div className="h-full flex bg-gray-50">
      <ConversationList
        conversations={mockConversations}
        selectedConversation={selectedConversation}
        onConversationSelect={handleConversationSelect}
        counts={counts}
      />
      <div className="p-4 pl-0 flex-1 h-screen bg-white">
        <div className="rounded-2xl border border-gray-200 h-full">
          <ChatPanel conversation={selectedConversation} onSendMessage={handleSendMessage} />
        </div>
      </div>

      <PatientDetailsSidebar patient={selectedPatient} />
    </div>
  );
}
