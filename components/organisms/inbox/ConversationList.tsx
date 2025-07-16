import type { ChatConversation, InboxCounts, InboxTab } from "@/app/(dashboard)/inbox/types";
import { Button, Input } from "@/components/atoms";
import { ConversationListItem } from "@/components/molecules/ConversationListItem";
import { InboxTabButton } from "@/components/molecules/InboxTabButton";
import { cn } from "@/lib/utils";
import { Filter, Plus, Search } from "lucide-react";
import { useState } from "react";

export interface ConversationListProps {
  conversations: ChatConversation[];
  selectedConversation: ChatConversation | null;
  onConversationSelect: (conversation: ChatConversation) => void;
  counts: InboxCounts;
  className?: string;
}

export function ConversationList({
  conversations,
  selectedConversation,
  onConversationSelect,
  counts,
  className,
}: ConversationListProps) {
  const [activeTab, setActiveTab] = useState<InboxTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations based on active tab and search
  const filteredConversations = conversations.filter((conversation) => {
    // Filter by tab
    let tabMatch = true;
    if (activeTab === "unread") {
      tabMatch = !conversation.isRead;
    } else if (activeTab === "read") {
      tabMatch = conversation.isRead;
    }

    // Filter by search query
    const searchMatch =
      searchQuery === "" ||
      conversation.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && searchMatch;
  });

  return (
    <div className={cn("flex flex-col h-full w-[350px] bg-white p-4", className)}>
      {/* Header */}
      <div className="flex-shrink-0">
        {/* Title and New Button */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
          <Button
            variant="default"
            size="icon"
            className="w-9 h-9 bg-brand-blue hover:bg-brand-blue-hover rounded-xl"
          >
            <Plus className="w-4 h-4 text-white" />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2">
            <Filter className="w-4 h-4 text-ui-icon-muted" />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 rounded-lg p-1 flex gap-2">
          <InboxTabButton
            tab="all"
            label="All"
            count={counts.all}
            isActive={activeTab === "all"}
            onClick={setActiveTab}
          />
          <InboxTabButton
            tab="unread"
            label="Unread"
            count={counts.unread}
            isActive={activeTab === "unread"}
            onClick={setActiveTab}
          />
          <InboxTabButton
            tab="read"
            label="Read"
            count={counts.read}
            isActive={activeTab === "read"}
            onClick={setActiveTab}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto mt-1">
        {filteredConversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedConversation?.id === conversation.id}
            onClick={onConversationSelect}
          />
        ))}

        {filteredConversations.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
