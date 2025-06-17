"use client";

import { Button, Input } from "@/components/atoms";
import { ChatMessages } from "@/components/molecules";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/organisms";
import { chatData } from "@/mock/chat.data";
import { format } from "date-fns";
import { Search, Send, X } from "lucide-react";
import { useState } from "react";

export default function InboxPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const selectedChatData = chatData.find((chat) => chat.id === selectedChat);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // Here you would typically send the message to your backend
    // For now, we'll just clear the input
    setNewMessage("");
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex flex-col gap-2 p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
        <p className="text-gray-500">
          Manage All Patient Messages, Queries, and Replies in One Place
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between px-6 pb-4">
        <div className="relative flex items-center">
          <Input
            placeholder="Search by name, phone number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-2 border-ui-border-subtle h-10 w-22 bg-white"
          />
          <div className="absolute left-3 pointer-events-none">
            <Search className="h-4.5 w-4.5 text-ui-icon-gray" />
          </div>
        </div>
        <span className="text-gray-500">{chatData.length} records</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border-t border-gray-200">
        <table className="w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Assignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Channel
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Message
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chatData.map((chat) => (
              <tr
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`cursor-pointer hover:bg-purple-50 transition-colors ${
                  !chat.isRead ? "bg-purple-50/50" : ""
                } ${selectedChat === chat.id ? "bg-purple-100" : ""}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(chat.timestamp, "yyyy-MM-dd hh:mm a")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold text-gray-900">{chat.name}</div>
                      <div className="text-sm text-gray-500">{chat.patientName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {chat.assignee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {chat.channel}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                  {chat.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chat Drawer */}
      <Drawer direction="right" open={!!selectedChat} onOpenChange={handleCloseChat}>
        <DrawerContent direction="right" className="w-32">
          {selectedChatData && (
            <>
              {/* Chat header */}
              <DrawerHeader className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-600">
                        {selectedChatData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <DrawerTitle className="text-lg font-semibold text-gray-900">
                        {selectedChatData.name}
                      </DrawerTitle>
                      <p className="text-sm text-gray-500">{selectedChatData.patientName}</p>
                    </div>
                  </div>
                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close panel</span>
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto">
                <ChatMessages messages={selectedChatData.messages} />
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-brand-gradient text-white hover:opacity-90"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
