"use client";

import { Button } from "@/components/atoms";
import { ChatInterface } from "@/components/organisms";
import { cn } from "@/lib/utils";
import { Edit, PanelLeft, Search } from "lucide-react";
import { useState } from "react";

const recentChats = [
  "Appointment Schedule",
  "Create campaign",
  "Patient follow-up",
  "Inventory management",
  "Staff scheduling",
];

export default function DashboardPage() {
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [hasChatStarted, setHasChatStarted] = useState(false);
  const [showDynamicContent, setShowDynamicContent] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const toggleChatSidebar = () => {
    setIsChatSidebarOpen(!isChatSidebarOpen);
  };

  const handleSendMessage = () => {
    if (!hasChatStarted) {
      setHasChatStarted(true);
    }

    // Increment message count and show dynamic content after 2nd message exchange
    const newCount = messageCount + 1;
    setMessageCount(newCount);

    if (newCount >= 2) {
      // Show dynamic content after 2nd AI reply (with delay for AI response)
      setTimeout(() => {
        setShowDynamicContent(true);
      }, 1500);
    }
  };

  const handleNewChat = () => {
    setHasChatStarted(false);
    setShowDynamicContent(false);
    setMessageCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50/40 flex">
      {/* Chat Sidebar */}
      <div
        className={cn(
          "bg-slate-50 border-r border-gray-200 transition-all duration-300 overflow-hidden",
          isChatSidebarOpen ? "w-60" : "w-12",
        )}
      >
        {/* Toggle Button */}
        <div className="p-2 flex justify-end">
          <Button
            onClick={toggleChatSidebar}
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-slate-200"
          >
            <PanelLeft className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* Sidebar Content */}
        {isChatSidebarOpen && (
          <div className="px-2 pb-4 space-y-4">
            {/* New Chat & Search Chat */}
            <div className="space-y-1">
              <Button
                onClick={handleNewChat}
                variant="ghost"
                className="w-full justify-start gap-2 h-10 px-2 bg-slate-100 text-purple-600 hover:bg-slate-200"
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">New Chat</span>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-10 px-2 text-gray-700 hover:bg-slate-100"
              >
                <Search className="h-4 w-4" />
                <span className="text-sm font-medium">Search Chat</span>
              </Button>
            </div>

            {/* Recents Section */}
            <div className="space-y-1">
              <div className="px-2 py-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Recents
                </span>
              </div>

              <div className="space-y-1">
                {recentChats.map((chat, index) => (
                  <Button
                    key={chat}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-8 px-2 text-gray-600 hover:bg-slate-100 text-sm",
                      index === 0 && "bg-slate-100 text-gray-700",
                    )}
                  >
                    <span className="truncate">{chat}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div
            className={cn(
              "w-full flex flex-col items-center",
              hasChatStarted ? "h-full" : "justify-center px-8 h-full",
            )}
          >
            <div
              className={cn(
                "w-full flex flex-col items-center",
                hasChatStarted && !showDynamicContent ? "max-w-2xl" : "",
                hasChatStarted ? "h-full" : "justify-center",
              )}
            >
              <ChatInterface
                onSendMessage={handleSendMessage}
                hasChatStarted={hasChatStarted}
                username="Rachel"
                showDynamicContent={showDynamicContent}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
