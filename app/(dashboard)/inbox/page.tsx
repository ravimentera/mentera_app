"use client";

import { PatientOverview } from "@/components/organisms/approvals";
import {
  ChatPanel,
  CommunicationCompositionDialog,
  ConversationList,
} from "@/components/organisms/inbox";
import {
  type CreateCommunicationResponseRequest,
  type GenerateMessageRequest,
  useCreateCommunicationResponseMutation,
  useGenerateMessageMutation,
  useGetConversationQuery,
  useGetProviderInboxQuery,
  useMarkConversationReadMutation,
} from "@/lib/store/api/communicationsApi";
import {
  transformInboxDataToConversations,
  updateConversationWithDetailedMessages,
} from "@/utils/inbox.utils";
import { getLoggedInUserFirstName, getLoggedInUserProviderId } from "@/utils/provider.utils";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ChatConversation, InboxCounts } from "./types";

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [conversationWithCompleteMessages, setConversationWithCompleteMessages] =
    useState<ChatConversation | null>(null);
  // Track read status changes locally to update filters immediately
  const [readStatusUpdates, setReadStatusUpdates] = useState<Record<string, boolean>>({});

  // Communication composition dialog state
  const [isCommunicationDialogOpen, setIsCommunicationDialogOpen] = useState(false);
  const [communicationDialogProps, setCommunicationDialogProps] = useState<{
    patientId: string;
    patientName: string;
    recipientEmail: string;
    recipientPhone: string;
    initialChannel: "SMS" | "EMAIL";
  } | null>(null);

  // Use logged-in user provider ID - in real app this would come from auth context
  const providerId = getLoggedInUserProviderId();

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

  // Mark conversation as read mutation
  const [markConversationRead] = useMarkConversationReadMutation();

  // Create communication response mutation
  const [createCommunicationResponse, { isLoading: isSendingMessage }] =
    useCreateCommunicationResponseMutation();

  // Generate AI message mutation
  const [generateMessage, { isLoading: isGeneratingMessage }] = useGenerateMessageMutation();

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

  const handleConversationSelect = async (conversation: ChatConversation) => {
    // Don't re-select if it's the same conversation to preserve complete messages
    if (conversation.id === selectedConversation?.id) {
      return;
    }
    setSelectedConversation(conversation);
    // Clear previous complete messages while new ones load
    setConversationWithCompleteMessages(conversation);

    // Mark as read when selected (if it wasn't already read)
    if (!conversation.isRead) {
      // Update local state immediately for UI responsiveness
      setReadStatusUpdates((prev) => ({
        ...prev,
        [conversation.id]: true,
      }));

      // Call API to mark conversation as read
      try {
        await markConversationRead({
          providerId,
          patientId: conversation.patientId,
          body: { isRead: true },
        }).unwrap();
      } catch (error) {
        console.error("Failed to mark conversation as read:", error);
        // Revert local state on error
        setReadStatusUpdates((prev) => ({
          ...prev,
          [conversation.id]: false,
        }));
      }
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!conversationWithCompleteMessages) return;

    // Create optimistic message for immediate UI update
    const newMessage = {
      id: `msg-${Date.now()}`,
      text: messageText,
      sender: "provider" as const,
      timestamp: new Date(),
      isOutbound: true,
    };

    // Update UI immediately for better UX
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

    // Send message via API
    try {
      const request: CreateCommunicationResponseRequest = {
        patientId: conversationWithCompleteMessages.patientId,
        providerId,
        channel: conversationWithCompleteMessages.channel === "Email" ? "EMAIL" : "SMS",
        content: messageText,
        messageType: "GENERAL",
        direction: "OUTBOUND",
        eventId: null,
        notificationId: null,
        status: "RECEIVED",
        metadata: {
          direction: "OUTBOUND",
          patientName: conversationWithCompleteMessages.patientName,
        },
      };

      await createCommunicationResponse(request).unwrap();
    } catch (error) {
      console.error("Failed to send message:", error);
      // Could show error toast here if needed
      // toast.error("Failed to send message. Please try again.");
    }
  };

  const handleCommunicationCompose = (
    patientId: string,
    patientName: string,
    email: string,
    phone: string,
    channel: "SMS" | "EMAIL",
  ) => {
    setCommunicationDialogProps({
      patientId,
      patientName,
      recipientEmail: email,
      recipientPhone: phone,
      initialChannel: channel,
    });
    setIsCommunicationDialogOpen(true);
  };

  const handleCommunicationSend = (channel: "SMS" | "EMAIL", subject: string, message: string) => {
    // Communication send is handled by the CommunicationCompositionDialog component
    // This callback can be used for additional handling if needed
  };

  const handleGenerateAIMessage = async (
    context: {
      patientId: string;
      patientName: string;
      channel: "SMS" | "EMAIL";
    },
    callbacks?: {
      onMessageGenerated?: (message: string) => void;
      onSubjectGenerated?: (subject: string) => void;
    },
  ) => {
    try {
      const request: GenerateMessageRequest = {
        patientId: context.patientId,
        providerId,
        channel: context.channel,
        messageType: "AI_GENERATED",
        direction: "OUTBOUND",
        patientInfo: {
          patientId: context.patientId,
          patientName: context.patientName,
        },
        treatmentInfo: {},
        contextData: {
          medSpaFacility: "Global Healthcare", // This could be dynamic from user context
          provideId: providerId,
          providerName: getLoggedInUserFirstName(),
        },
        prompt: "",
        tone: "professional",
        format: "text",
        metadata: {},
      };

      const result = await generateMessage(request).unwrap();

      // Extract content and subject if needed
      let content = result.data.content;
      let subject = "";

      // If it's an email, extract subject from content if it contains "Subject:"
      if (context.channel === "EMAIL" && content.includes("Subject:")) {
        const lines = content.split("\n");
        const subjectLine = lines.find((line) => line.startsWith("Subject:"));
        if (subjectLine) {
          subject = subjectLine.replace("Subject:", "").trim();
          // Remove subject line from content
          const contentWithoutSubject = lines
            .filter((line) => !line.startsWith("Subject:"))
            .join("\n")
            .trim();
          content = contentWithoutSubject;
        }
      }

      // Call the callbacks to update the UI
      if (callbacks?.onMessageGenerated) {
        callbacks.onMessageGenerated(content);
      }
      if (callbacks?.onSubjectGenerated && subject) {
        callbacks.onSubjectGenerated(subject);
      }

      toast.success("AI message generated successfully!");
    } catch (error) {
      console.error("Failed to generate AI message:", error);
      toast.error("Failed to generate AI message. Please try again.");
    }
  };

  // Wrapper for chat context
  const handleChatAIGeneration = async (
    onMessageGenerated?: (message: string, subject?: string) => void,
  ) => {
    if (!conversationWithCompleteMessages) return;

    let capturedSubject = "";

    await handleGenerateAIMessage(
      {
        patientId: conversationWithCompleteMessages.patientId,
        patientName: conversationWithCompleteMessages.patientName,
        channel: conversationWithCompleteMessages.channel === "Email" ? "EMAIL" : "SMS",
      },
      {
        onMessageGenerated: (content) => {
          if (onMessageGenerated) {
            onMessageGenerated(content, capturedSubject);
          }
        },
        onSubjectGenerated: (subject) => {
          capturedSubject = subject;
        },
      },
    );
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
        onCommunicationCompose={handleCommunicationCompose}
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
              isLoading={isSendingMessage}
              onGenerateAIMessage={handleChatAIGeneration}
              isGeneratingAI={isGeneratingMessage}
            />
          )}
        </div>
      </div>

      {selectedConversation ? (
        <PatientOverview
          patientId={selectedConversation.patientId}
          className="w-[340px] bg-white"
        />
      ) : (
        <div className="w-[340px] bg-white p-6">
          <div className="text-center text-gray-500">
            <p>Select a conversation to view patient details</p>
          </div>
        </div>
      )}

      {/* Communication Composition Dialog */}
      {communicationDialogProps && (
        <CommunicationCompositionDialog
          open={isCommunicationDialogOpen}
          onOpenChange={setIsCommunicationDialogOpen}
          patientId={communicationDialogProps.patientId}
          patientName={communicationDialogProps.patientName}
          recipientEmail={communicationDialogProps.recipientEmail}
          recipientPhone={communicationDialogProps.recipientPhone}
          initialChannel={communicationDialogProps.initialChannel}
          onSend={handleCommunicationSend}
          onGenerateAIMessage={handleGenerateAIMessage}
          isGeneratingAI={isGeneratingMessage}
        />
      )}
    </div>
  );
}
