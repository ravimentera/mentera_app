// lib/hooks/useChatMockHandler.ts
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";

// Assuming ChatMessage type is defined in a shared location or useWebSocketChat's types.ts
import type { ChatMessage } from "@/components/organisms/chat/types"; // Adjust path as needed
import type { AppDispatch } from "@/lib/store";
import { fetchDynamicLayout } from "@/lib/store/dynamicLayoutSlice";
import { addMessage } from "@/lib/store/messagesSlice";
import { sanitizeMarkdown } from "@/lib/utils"; // Assuming this path is correct

import { patientDatabase as mockPatientDatabase } from "@/mock/chat.data"; // For patient context in mock
// Import the core mock response generation logic
import { generateMockAiResponse } from "@/mock/mockTera/chatWebSocketMockLogic"; // Adjust path as needed

/**
 * Extracts the actual message content after a "Bot: " marker.
 */
const getBotActualResponse = (rawContent: string): string => {
  const botMarker = "Bot: ";
  const markerIndex = rawContent.indexOf(botMarker);
  if (markerIndex !== -1) {
    return rawContent.substring(markerIndex + botMarker.length).trim();
  }
  return rawContent.trim();
};

// Determine if client-side mocking is enabled
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const ENABLE_MOCK_CHAT = true;
//   IS_DEVELOPMENT && process.env.NEXT_PUBLIC_ENABLE_MOCK_CHAT === "true";

interface UseChatMockHandlerProps {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentPatientId: keyof typeof mockPatientDatabase; // Use the imported mockPatientDatabase type
  isPatientContextEnabled: boolean;
}

interface UseChatMockHandlerReturn {
  isMockActive: boolean;
  initialMockConnectedState: boolean;
  mockSendMessage: ((text: string) => void) | null;
}

export function useChatMockHandler({
  setMessages,
  setLoading,
  currentPatientId,
  isPatientContextEnabled,
}: UseChatMockHandlerProps): UseChatMockHandlerReturn {
  const dispatch = useDispatch<AppDispatch>();

  const handleMockResponse = useCallback(
    (aiFullResponse: string) => {
      setLoading(true);
      console.log("[MockChatHandler] Simulating chat_stream_start");

      setTimeout(
        () => {
          const actualBotMessageForDisplay = getBotActualResponse(aiFullResponse);
          const chatResponseMessage: ChatMessage = {
            id: uuid(),
            sender: "ai",
            text: sanitizeMarkdown(actualBotMessageForDisplay),
          };

          setMessages((prev) => [...prev, chatResponseMessage]);
          dispatch(addMessage(chatResponseMessage));
          setLoading(false);
          console.log(
            "[MockChatHandler] Simulating chat_response. Display text:",
            actualBotMessageForDisplay,
          );

          if (actualBotMessageForDisplay.trim()) {
            console.log(
              "[MockChatHandler] Dispatching fetchDynamicLayout:",
              actualBotMessageForDisplay,
            );
            dispatch(fetchDynamicLayout(actualBotMessageForDisplay));
          }
        },
        800 + Math.random() * 1200,
      );
    },
    [dispatch, setLoading, setMessages],
  );

  const mockSendMessage = useCallback(
    (text: string) => {
      if (!ENABLE_MOCK_CHAT) return;

      console.log("[MockChatHandler] Handling sendMessage with mock logic.");
      const patient = mockPatientDatabase[currentPatientId];
      const mockPatientContext =
        isPatientContextEnabled && patient ? { id: patient.id } : undefined;

      const aiResponse = generateMockAiResponse(text, mockPatientContext);
      handleMockResponse(aiResponse);
    },
    [currentPatientId, isPatientContextEnabled, handleMockResponse],
  );

  return {
    isMockActive: ENABLE_MOCK_CHAT,
    initialMockConnectedState: ENABLE_MOCK_CHAT, // If mock is active, consider it "connected"
    mockSendMessage: ENABLE_MOCK_CHAT ? mockSendMessage : null,
  };
}
