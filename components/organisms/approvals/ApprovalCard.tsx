"use client";

import ChatMessages from "@/app/components/ChatMessages";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { ApprovalCardData, ApprovalChatMessage } from "@/lib/store/approvalsSlice";
import { RefreshCw, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import React, { useState, useEffect } from "react";

interface ApprovalCardComponentProps {
  cardData: ApprovalCardData;
  alternativeMessages: string[];
  onAction: (actionType: "approved" | "disapproved", messageContent?: string) => void;
  onRegenerate: () => void;
  onUseCopy: (newMessage: string) => void;
  onShowTeraCompose: (show: boolean) => void;
  onSendChatMessage: (messageText: string) => void;
}

export function ApprovalCardComponent({
  cardData,
  alternativeMessages,
  onAction,
  onRegenerate,
  onUseCopy,
  onShowTeraCompose,
  onSendChatMessage,
}: ApprovalCardComponentProps) {
  const [editedTeraComposeMessage, setEditedTeraComposeMessage] = useState("");
  const [newChatMessage, setNewChatMessage] = useState("");

  useEffect(() => {
    // When cardData changes (e.g., navigating to a new card),
    // reset the editedTeraComposeMessage based on the new card's state.
    if (cardData.showTeraCompose) {
      if (cardData.messageVariant === 0) {
        setEditedTeraComposeMessage(cardData.aiGeneratedMessage || cardData.originalMessage);
      } else if (cardData.messageVariant && cardData.messageVariant > 0) {
        setEditedTeraComposeMessage(alternativeMessages[cardData.messageVariant - 1] || "");
      }
    } else {
      setEditedTeraComposeMessage(""); // Clear if Tera Compose is not shown
    }
  }, [
    cardData.showTeraCompose,
    cardData.messageVariant,
    cardData.aiGeneratedMessage,
    cardData.originalMessage,
    alternativeMessages,
  ]);

  const getBadgeType = (type: "pre-care" | "post-care") => {
    return type === "pre-care" ? "Reminder" : "Follow-up";
  };

  const handleRegenerateClick = () => {
    // For the 3rd card (index 2 in a 0-indexed array, assuming cardData.id might reflect this)
    // This logic might be better placed in the container if it depends on global index
    // For now, let's assume if a card has chat history, it's the "special" card.
    if (cardData.chatHistory && cardData.chatHistory.length > 0) {
      console.log(
        "Regenerate clicked on card with chat history - not showing Tera Compose via this button",
      );
      onShowTeraCompose(false); // Ensure it's hidden
      // Potentially call a different regenerate logic if needed
    } else {
      onShowTeraCompose(true); // Show compose box
      onRegenerate(); // Cycle message variant
    }
  };

  const handleUseThisCopy = () => {
    onUseCopy(editedTeraComposeMessage); // Dispatch action to update message in Redux
    onShowTeraCompose(false); // Hide compose box
  };

  const handleSendChatMessageInternal = () => {
    if (!newChatMessage.trim()) return;
    onSendChatMessage(newChatMessage);
    setNewChatMessage("");
  };

  return (
    <div className="p-6 bg-[#FAFAFA] h-[calc(100vh-130px)] flex justify-center overflow-auto">
      <div className="max-w-[600px] w-full flex flex-col">
        {" "}
        {/* Added w-full */}
        {/* Header section of the card */}
        <div className="p-4 bg-[#FAE8FF] border-b border-[#E4E4E7] rounded-t-2xl">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold text-[#09090B]">{cardData.subject}</h2>
            <div className="flex flex-col items-center gap-2">
              <span className="px-1 bg-[#F0FDF4] text-[#047857] text-sm font-medium rounded-sm">
                {getBadgeType(cardData.notificationType)}
              </span>
              <span className="text-xs text-[#71717A]">{cardData.time}</span>
            </div>
          </div>
        </div>
        {/* Main content section of the card */}
        <div className="p-4 overflow-auto bg-white rounded-b-xl flex-1 flex flex-col justify-between">
          <div className="flex flex-col">
            {" "}
            {/* Top part of content: patient info, message, chat */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center text-lg font-medium text-blue-600">
                {cardData.patientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-[#09090B]">{cardData.patientName}</h3>
                  {cardData.isVip && (
                    <span className="px-2 py-1 bg-[#EFF6FF] text-[#2563EB] rounded text-sm font-medium">
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[#71717A]">{cardData.patientId}</p>
              </div>
            </div>
            <p className="text-[#09090B] text-sm mb-4 whitespace-pre-wrap">{cardData.message}</p>
            {/* Chat history section */}
            {cardData.chatHistory && cardData.chatHistory.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-[#71717A] mb-2">Previous Conversation</h4>
                <div className="border border-gray-200 rounded-lg bg-white h-[15em] sm:h-[20em] md:h-[23em] overflow-y-auto p-2">
                  <ChatMessages
                    messages={cardData.chatHistory.map((m) => ({
                      ...m,
                      timestamp: new Date(m.timestamp),
                    }))}
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessageInternal();
                      }
                    }}
                  />
                  <Button onClick={handleSendChatMessageInternal} size="sm">
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Tera Compose and Action Buttons Section */}
          <div className="mt-auto pt-4">
            {" "}
            {/* Pushes to bottom */}
            {cardData.showTeraCompose && (
              <div className="relative mb-4">
                <div className="bg-[#FAFAFA] rounded-lg border border-[#BD05DD]">
                  {" "}
                  {/* Changed border color */}
                  <div className="flex items-center gap-1 mb-2 absolute -top-3 left-2 bg-gradient-to-r from-[#111A53] to-[#BD05DD] rounded-sm px-2 py-1">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold text-xs">Tera Compose</span>
                  </div>
                  <Textarea
                    value={editedTeraComposeMessage}
                    onChange={(e) => setEditedTeraComposeMessage(e.target.value)}
                    className="text-[#09090B] text-sm p-4 pb-0 pt-6 flex-1 min-h-[100px] bg-transparent border-0 focus-visible:ring-0"
                    placeholder="AI generated message will appear here..."
                  />
                  <button
                    type="button"
                    onClick={handleUseThisCopy}
                    className="m-4 ml-auto block text-[#6941C6] text-sm font-medium hover:underline disabled:opacity-50"
                    disabled={!editedTeraComposeMessage.trim()}
                  >
                    Use this copy
                  </button>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  onAction(
                    "approved",
                    cardData.messageVariant === 0 ? cardData.message : editedTeraComposeMessage,
                  )
                }
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-[#DCFCE7] text-[#15803D] rounded-lg hover:bg-green-100 transition-colors"
              >
                <ThumbsUp size={20} />
                <span className="text-sm">Approve & Send</span>
              </Button>
              <Button
                onClick={() => onAction("disapproved")}
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-[#FFE4E6] text-[#BE123C] rounded-lg hover:bg-red-100 transition-colors"
              >
                <ThumbsDown size={20} />
                <span className="text-sm">Decline</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleRegenerateClick}
                className="flex-1 flex items-center justify-center gap-2 p-2 border border-[#8A03D3] text-[#8A03D3] rounded-lg hover:bg-purple-50 transition-colors"
              >
                <RefreshCw size={20} />
                <span className="text-sm">Regenerate</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
