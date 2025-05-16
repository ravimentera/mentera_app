// In messageConverter.ts
import { ThreadMessageLike } from "@assistant-ui/react";
import { ChatMessage as YourChatMessageFormat } from "./types";

export const convertToUIMessage = (msg: YourChatMessageFormat): ThreadMessageLike => {
  // Ensure msg.text is always a string. If it can be undefined or null, provide a fallback.
  const messageText = typeof msg.text === "string" ? msg.text : ""; // Fallback to empty string

  return {
    id: msg.id,
    role: msg.sender === "user" ? "user" : "assistant",
    content: [{ type: "text", text: messageText }], // Ensure messageText is always a string
    // createdAt: new Date(msg.timestamp), // If you have timestamps
  };
};
