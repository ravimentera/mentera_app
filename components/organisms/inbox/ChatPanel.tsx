import type { ChatConversation } from "@/app/(dashboard)/inbox/types";
import { Avatar, AvatarFallback, Button, Input, Textarea } from "@/components/atoms";
import { MessageBubble } from "@/components/atoms/MessageBubble";
import { Icon, IconName } from "@/components/atoms/icons";
import { ChatInput } from "@/components/molecules/ChatInput";
import { cn } from "@/lib/utils";
import { formatMessageDate, shouldShowDateHeader } from "@/utils/date.utils";
import { getLoggedInUserFirstName } from "@/utils/provider.utils";
import { MessageSquare, RefreshCw, ThumbsUp, X } from "lucide-react";
import { useEffect, useState } from "react";

export interface ChatPanelProps {
  conversation: ChatConversation | null;
  onSendMessage?: (message: string) => void;
  onGenerateAIMessage?: (onMessageGenerated?: (message: string, subject?: string) => void) => void;
  className?: string;
  isLoading?: boolean;
  isGeneratingAI?: boolean;
}

export function ChatPanel({
  conversation,
  onSendMessage,
  onGenerateAIMessage,
  className,
  isLoading = false,
  isGeneratingAI = false,
}: ChatPanelProps) {
  const [messageText, setMessageText] = useState("");
  const [aiGeneratedEmail, setAiGeneratedEmail] = useState<{
    subject: string;
    content: string;
  } | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [prevConversationId, setPrevConversationId] = useState<string | null>(null);

  // Clear inputs and show loading when conversation ID changes
  useEffect(() => {
    const currentConversationId = conversation?.id || null;

    // Only trigger changes if conversation ID actually changed
    if (currentConversationId !== prevConversationId && currentConversationId !== null) {
      // Clear all input states only when switching to a different conversation
      setMessageText("");
      setAiGeneratedEmail(null);
      setEditedSubject("");
      setEditedContent("");

      // Show loading state briefly to prevent flickering, but only when switching from one conversation to another
      if (prevConversationId !== null) {
        setIsConversationLoading(true);
        const timer = setTimeout(() => {
          setIsConversationLoading(false);
        }, 300); // 300ms loading delay to smooth transition

        return () => clearTimeout(timer);
      }

      setPrevConversationId(currentConversationId);
    } else if (currentConversationId === null && prevConversationId !== null) {
      // Handle case when conversation is deselected (going to null)
      setMessageText("");
      setAiGeneratedEmail(null);
      setEditedSubject("");
      setEditedContent("");
      setPrevConversationId(null);
    }
  }, [conversation?.id, prevConversationId]);

  const handleSendMessage = () => {
    if (messageText.trim() && onSendMessage && !isLoading) {
      onSendMessage(messageText.trim());
      setMessageText("");
    }
  };

  const handleEmailAIGeneration = (content: string, subject?: string) => {
    if (conversation?.channel === "Email") {
      // For email, show approval interface
      const emailSubject = subject || "AI Generated Email";
      setAiGeneratedEmail({
        subject: emailSubject,
        content: content,
      });
      setEditedSubject(emailSubject);
      setEditedContent(content);
    } else {
      // For SMS, directly populate input
      setMessageText(content);
    }
  };

  const handleApproveEmail = () => {
    if (aiGeneratedEmail && onSendMessage) {
      // Send the approved email with edited content
      onSendMessage(`Subject: ${editedSubject}\n\n${editedContent}`);
      setAiGeneratedEmail(null);
      setEditedSubject("");
      setEditedContent("");
    }
  };

  const handleDeclineEmail = () => {
    setAiGeneratedEmail(null);
    setEditedSubject("");
    setEditedContent("");
  };

  const handleRegenerateEmail = () => {
    if (onGenerateAIMessage) {
      onGenerateAIMessage(handleEmailAIGeneration);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <div
        className={cn(
          "flex-1 flex items-center justify-center rounded-2xl bg-gray-50 h-full",
          className,
        )}
      >
        <div className="text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const channelIconColor = conversation.channel === "SMS" ? "text-cyan-500" : "text-yellow-500";

  // Show loading state during conversation transition
  if (isConversationLoading) {
    return (
      <div
        className={cn(
          "flex-1 flex flex-col bg-white rounded-2xl h-[calc(100vh-34px)] relative",
          className,
        )}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-1 flex flex-col bg-white rounded-2xl h-[calc(100vh-34px)] relative",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-4 bg-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-emerald-50 text-gray-600 text-sm font-medium">
              {conversation.patientInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-text">{conversation.patientName}</h2>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-1 bg-cyan-50 rounded-md px-2 py-1",
                  conversation.channel === "SMS"
                    ? "bg-cyan-50  text-cyan-500"
                    : "bg-yellow-50 text-yellow-500",
                )}
              >
                <Icon
                  name={conversation.channel === "SMS" ? IconName.MESSAGE_SQUARE : IconName.MAIL}
                  width={12}
                  height={12}
                  color={conversation.channel === "SMS" ? "#06b6d4" : "#FACC15"}
                />
                <p className={cn("text-sm", channelIconColor)}>{conversation.channel}</p>
              </div>
              <p className="text-sm text-gray-600">{conversation.patientId}</p>
            </div>
          </div>
        </div>

        {/* <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div> */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {conversation.messages.reduce((acc: JSX.Element[], message, index, array) => {
          // Get current and previous message dates
          const currentDate = new Date(message.timestamp);
          const prevDate = index > 0 ? new Date(array[index - 1].timestamp) : null;

          // Check if we need to show a date header
          if (shouldShowDateHeader(currentDate, prevDate)) {
            acc.push(
              <div key={`date-${message.id}`} className="flex justify-center my-4">
                <span className="text-xs text-text-muted font-medium">
                  {formatMessageDate(currentDate)}
                </span>
              </div>,
            );
          }

          acc.push(
            <div key={message.id} className="space-y-1">
              <MessageBubble text={message.text} isOutbound={message.isOutbound} />
            </div>,
          );

          return acc;
        }, [])}
      </div>

      {/* AI Generated Email Approval Dialog */}
      {aiGeneratedEmail && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-[999] bg-black/80 animate-in fade-in-0" />

          {/* Dialog Content */}
          <div
            className="w-full max-h-[80vh] flex flex-col absolute left-0 right-0 bottom-0 top-auto translate-x-0 translate-y-0 z-[999] bg-background p-6 shadow-lg duration-200 rounded-t-lg rounded-b-none border-t border-l border-r animate-in slide-in-from-bottom-full"
            data-state="open"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleDeclineEmail}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <div className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {getLoggedInUserFirstName()} to {conversation?.patientName || "Patient"}
                  {conversation?.channel === "Email" && (
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {/* TODO: Email would come from patient data */}
                      {(conversation as any)?.recipientEmail || "patient@email.com"}
                    </span>
                  )}
                </h2>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
              {/* Subject Input */}
              <div className="space-y-2">
                <Input
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full text-lg font-normal"
                  placeholder="Email subject"
                />
              </div>
              <div className="border border-gray-200 rounded-lg">
                <div className="border-b p-3 border-gray-200 ">
                  <span className="font-semibold text-base bg-gradient-brand bg-clip-text text-transparent ">
                    Tera Compose
                  </span>
                </div>

                {/* Content Textarea */}
                <div className="space-y-2">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-80 !border-none resize-none text-sm"
                    placeholder="Email content"
                  />
                </div>
                {/* Bottom Actions */}
                <div className="flex items-center justify-between p-3 pl-0">
                  {/* Regenerate Button */}
                  <Button
                    onClick={handleRegenerateEmail}
                    variant="flat-transparent"
                    className="flex items-center text-brand-blue"
                    disabled={isGeneratingAI}
                  >
                    <RefreshCw className={cn("h-4 w-4", isGeneratingAI && "animate-spin")} />
                  </Button>

                  {/* Approve/Decline Actions */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleDeclineEmail}
                      className="flex items-center gap-2 text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                    <Button
                      onClick={handleApproveEmail}
                      className="flex items-center gap-2 text-green-700 bg-green-50 hover:bg-green-100"
                      disabled={!editedSubject.trim() || !editedContent.trim()}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Approve & Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white rounded-2xl">
        <ChatInput
          message={messageText}
          onMessageChange={(e: any) => setMessageText(e)}
          onSend={handleSendMessage}
          onKeyUp={handleKeyPress}
          placeholder="Write your message"
          showPrompts={false}
          customBorderClassName="border-t border-gray-200 border-b-0"
          isLoading={isLoading}
          disabled={isLoading || isGeneratingAI || !!aiGeneratedEmail || isConversationLoading}
          onGenerateAIMessage={onGenerateAIMessage}
          isGeneratingAI={isGeneratingAI}
          onMessageGenerated={handleEmailAIGeneration}
        />
      </div>
    </div>
  );
}
