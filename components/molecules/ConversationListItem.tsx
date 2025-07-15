import type { ChatConversation } from "@/app/(dashboard)/inbox/types";
import { Avatar, AvatarFallback } from "@/components/atoms";
import { InboxCounter } from "@/components/atoms/InboxCounter";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/utils/date.utils";
import { Icon, IconName } from "../atoms/icons";

export interface ConversationListItemProps {
  conversation: ChatConversation;
  isSelected?: boolean;
  onClick: (conversation: ChatConversation) => void;
  className?: string;
}

export function ConversationListItem({
  conversation,
  isSelected = false,
  onClick,
  className,
}: ConversationListItemProps) {
  return (
    <div
      onClick={() => onClick(conversation)}
      className={cn(
        "flex items-start gap-2 p-4 cursor-pointer transition-colors rounded-xl border-b border-gray-100",
        isSelected ? "bg-blue-50" : "hover:bg-gray-50",
        !conversation.isRead && "bg-blue-25",
        className,
      )}
    >
      {/* Avatar */}
      <Avatar className="w-12 h-12 flex-shrink-0">
        <AvatarFallback className="bg-emerald-50 text-gray-600 text-lg font-medium">
          {conversation.patientInitials}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header with name and time */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {conversation.patientName}
          </h3>
          <span className="text-xs text-gray-600 flex-shrink-0">
            {formatMessageTime(conversation.timestamp)}
          </span>
        </div>

        {/* Message preview and indicators */}
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-600 line-clamp-2 flex-1">{conversation.lastMessage}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {conversation.unreadCount > 0 && (
              <InboxCounter count={conversation.unreadCount} variant="primary" />
            )}
            <Icon
              name={conversation.channel === "SMS" ? IconName.MESSAGE_SQUARE : IconName.MAIL}
              width={16}
              height={16}
              color={conversation.channel === "SMS" ? "#06b6d4" : "#FACC15"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
