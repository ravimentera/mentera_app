import type { ChatConversation } from "@/app/(dashboard)/inbox/types";
import { Avatar, AvatarFallback } from "@/components/atoms";
import { MessageBubble } from "@/components/atoms/MessageBubble";
import { Icon, IconName } from "@/components/atoms/icons";
import { ChatInput } from "@/components/molecules/ChatInput";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/mock/inbox.data";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

export interface ChatPanelProps {
  conversation: ChatConversation | null;
  onSendMessage?: (message: string) => void;
  className?: string;
}

export function ChatPanel({ conversation, onSendMessage, className }: ChatPanelProps) {
  const [messageText, setMessageText] = useState("");

  const handleSendMessage = () => {
    if (messageText.trim() && onSendMessage) {
      onSendMessage(messageText.trim());
      setMessageText("");
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
  console.log(conversation);
  return (
    <div
      className={cn("flex-1 flex flex-col bg-white rounded-2xl h-[calc(100vh-34px)]", className)}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 ">
        {conversation.messages.map((message, index) => (
          <div key={message.id} className="space-y-1">
            <MessageBubble text={message.text} isOutbound={message.isOutbound} />
            <div
              className={cn(
                "text-xs text-gray-500 px-1",
                message.isOutbound ? "text-right" : "text-left",
              )}
            >
              {formatMessageTime(message.timestamp)}
            </div>
          </div>
        ))}
      </div>

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
        />
      </div>
    </div>
  );
}
