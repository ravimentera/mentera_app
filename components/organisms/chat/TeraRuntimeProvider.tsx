// components/organisms/chat/TeraRuntimeProvider.tsx

"use client";

import { RootState } from "@/lib/store";
import {
  AssistantRuntimeProvider as AUIAssistantRuntimeProvider,
  AppendMessage,
  ThreadMessageLike,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { useSelector } from "react-redux";
import { ChatMessage } from "./types";
import { useWebSocketChat } from "./useWebSocketChat";

interface TeraRuntimeProviderProps {
  children: React.ReactNode;
  currentPatientId: string; // Or your actual type
  isPatientContextEnabled: boolean;
  forceFresh: boolean;
  cacheDebug: boolean;
}

// This function converts YOUR ChatMessage format to assistant-ui's ThreadMessageLike
// Ensure this function correctly handles any potential undefined/null for msg.text
const convertToAssistantUIMessage = (msg: ChatMessage): ThreadMessageLike => {
  return {
    id: msg.id, // Make sure msg.id is always a string
    role: msg.sender === "user" ? "user" : "assistant",
    content: [{ type: "text", text: typeof msg.text === "string" ? msg.text : "" }], // Ensure text is a string
    // createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(), // Example: if you have timestamps
  };
};

export function TeraRuntimeProvider({
  children,
  currentPatientId,
  isPatientContextEnabled,
  forceFresh,
  cacheDebug,
}: TeraRuntimeProviderProps) {
  // 1. Get messages from Redux in THEIR ORIGINAL FORMAT.
  //   useWebSocketChat hook is responsible for updating Redux with complete messages.
  const originalReduxMessages = useSelector(
    (state: RootState) => state.messages.items,
  ) as ChatMessage[];

  const {
    loading: isLoading, // This now represents the time until the WebSocket returns the *complete* message.
    sendMessage: sendViaWebSocket,
  } = useWebSocketChat({
    currentPatientId,
    isPatientContextEnabled,
    forceFresh,
    cacheDebug,
  });

  const onNew = async (message: AppendMessage) => {
    // 'message' here is from assistant-ui's input
    if (message.content[0]?.type === "text") {
      sendViaWebSocket(message.content[0].text);
    }
  };

  // 2. Messages for the runtime are now just the converted Redux messages.
  //    No need for special streamBuffer handling here if WebSocket provides full messages.
  const messagesForRuntime = originalReduxMessages;

  // Log what's being passed, this is still good for debugging if messages don't appear
  // console.log("TeraRuntimeProvider - isRunning:", isLoading);
  // console.log("TeraRuntimeProvider - messages (original format):", JSON.stringify(messagesForRuntime, null, 2));

  // 3. Pass originalReduxMessages and your convertToAssistantUIMessage function.
  const runtime = useExternalStoreRuntime<ChatMessage>({
    // Specify your message type
    messages: messagesForRuntime, // Pass messages in YOUR app's original format
    isRunning: isLoading, // Reflects if AI is "thinking" / WebSocket is pending
    onNew,
    convertMessage: convertToAssistantUIMessage, // Function to convert YourChatMessage -> ThreadMessageLike
  });

  return <AUIAssistantRuntimeProvider runtime={runtime}>{children}</AUIAssistantRuntimeProvider>;
}
