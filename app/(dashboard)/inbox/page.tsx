"use client";

import ChatMessages from "@/app/components/ChatMessages";
import { Input } from "@/components/ui/input";
import { chatData } from "@/mock/chat.data";
import { format } from "date-fns";
import { Search, Send } from "lucide-react";
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
            className="pl-10 py-2 border-[#E5E7EB] h-10 w-[350px] bg-white"
          />
          <div className="absolute left-3 pointer-events-none">
            <Search className="h-[18px] w-[18px] text-[#9CA3AF]" />
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

      {/* Chat Panel */}
      {selectedChat && selectedChatData && (
        <div className="fixed top-0 right-0 w-[500px] h-full bg-white border-l border-gray-200 shadow-lg flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200">
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
                  <h3 className="text-lg font-semibold text-gray-900">{selectedChatData.name}</h3>
                  <p className="text-sm text-gray-500">{selectedChatData.patientName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChat(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close panel</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto">
            <ChatMessages messages={selectedChatData.messages} />
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="p-2 bg-gradient-to-r from-[#BD05DD] to-[#111A53] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
