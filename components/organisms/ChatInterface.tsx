"use client";

import { PROMPT_SUGGESTIONS } from "@/app/constants/chat-constants";
import { ChatInput } from "@/components/molecules";
import { PromptChip } from "@/components/molecules/PromptChip";
import { MockPatientOverviewPanel } from "@/components/organisms/MockPatientOverviewPanel";
import { cn } from "@/lib/utils";
import type { ChatInterfaceProps, Message } from "@/types/chat";
import { useState } from "react";

function ChatMessage({ message }: { message: Message }) {
  return (
    <div className={cn("flex", message.isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-96 px-3 py-2 rounded-lg",
          message.isUser
            ? "bg-secondary-active text-gray-900 rounded-br-sm"
            : "bg-secondary-active text-gray-900 rounded-bl-sm",
        )}
      >
        <p className="text-base leading-6">{message.text}</p>
      </div>
    </div>
  );
}

export function ChatInterface({
  className,
  onSendMessage,
  hasChatStarted = false,
  username = "Rachel",
  showDynamicContent = false,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      onSendMessage();

      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sure, select patient first, I&apos;ll give you the summary",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 1000);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Chat conversation layout with split screen
  if (hasChatStarted) {
    return (
      <div className={cn("!h-screen flex", className)}>
        {/* Left side - Chat */}
        <div
          className={cn(
            "flex flex-col transition-all duration-300",
            showDynamicContent ? "w-1/2" : "w-full",
          )}
        >
          {/* Chat Messages - Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>

          {/* Chat Input - Fixed at bottom */}
          <div className="flex-shrink-0 px-4 py-6 bg-white">
            <ChatInput
              message={message}
              onMessageChange={setMessage}
              onSend={handleSend}
              onKeyUp={handleKeyPress}
            />
          </div>
        </div>

        {/* Right side - Dynamic Content Panel */}
        {showDynamicContent && (
          <div className="w-1/2 border-l border-gray-200 bg-white">
            {/* TODO: This component will be dynamically generated based on conversation context */}
            <MockPatientOverviewPanel />
          </div>
        )}
      </div>
    );
  }

  // Initial welcome layout
  return (
    <div className={cn("max-w-2xl space-y-6", className)}>
      {/* Welcome Section */}
      {!hasChatStarted && (
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-brand-gradient">Hello, {username}</h1>

          <div className="max-w-md mx-auto bg-subtle shadow-sm rounded-2xl px-5 py-3 text-left space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Today</p>
              <p className="text-base text-gray-800">
                <span className="font-normal">8 appointments</span> — first at{" "}
                <span className="font-normal">9:00 AM</span>, last at{" "}
                <span className="font-normal">4:30 PM</span>
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Reminders
              </p>
              <ul className="text-base text-gray-800 space-y-1 list-disc list-inside">
                <li>3 charts pending</li>
                <li>Pre-care needed (filler)</li>
                <li>Laser follow-up – Jenna R.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Chat Input Box */}
      <ChatInput
        message={message}
        onMessageChange={setMessage}
        onSend={handleSend}
        onKeyUp={handleKeyPress}
      />

      {/* Prompt Suggestions */}
      <div className="flex flex-wrap gap-2 justify-center">
        {PROMPT_SUGGESTIONS.map((prompt) => (
          <PromptChip
            key={prompt.text}
            emoji={prompt.emoji}
            onSelect={() => handlePromptSelect(prompt.text)}
          >
            {prompt.text}
          </PromptChip>
        ))}
      </div>
    </div>
  );
}
