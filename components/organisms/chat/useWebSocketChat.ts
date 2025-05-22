import { getWebSocketUrl } from "@/lib/getWebSocketUrl";
import { addMessage } from "@/lib/store/messagesSlice";
import { sanitizeMarkdown } from "@/lib/utils";
import { patientDatabase, testMedSpa, testNurse } from "@/mock/chat.data";
import WebSocket from "isomorphic-ws";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";
// Ensure PatientContextForMock is exported from your types file
import { ChatMessage, WebSocketResponseMessage } from "./types";
import { extractChunk, logMetadata } from "./utils";

import type { AppDispatch } from "@/lib/store";
import { fetchDynamicLayout } from "@/lib/store/dynamicLayoutSlice";

// Import the new mock handler hook
import { useChatMockHandler } from "@/mock/mockTera/useChatMockHandler";

interface UseChatWebSocketProps {
  currentPatientId: keyof typeof patientDatabase;
  isPatientContextEnabled: boolean;
  forceFresh: boolean;
  cacheDebug: boolean;
  onMessage?: (messages: ChatMessage[]) => void;
}

// This helper can remain here if the real WebSocket path also needs it,
// or be moved to utils if it's broadly used. The mock handler also defines its own.
const getBotActualResponse = (rawContent: string): string => {
  const botMarker = "Bot: ";
  const markerIndex = rawContent.indexOf(botMarker);
  if (markerIndex !== -1) {
    return rawContent.substring(markerIndex + botMarker.length).trim();
  }
  return rawContent.trim();
};

export function useWebSocketChat({
  currentPatientId,
  isPatientContextEnabled,
  forceFresh,
  cacheDebug,
}: UseChatWebSocketProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const retryDelay = 2000;
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false); // This loading is for chat messages
  const dispatch = useDispatch<AppDispatch>();

  // Use the mock handler hook
  // It provides the mock sending logic and status
  const { isMockActive, initialMockConnectedState, mockSendMessage } = useChatMockHandler({
    setMessages, // Pass state setter for messages
    setLoading, // Pass state setter for loading
    currentPatientId,
    isPatientContextEnabled,
  });

  // Initialize 'connected' state based on whether mocking is active
  const [connected, setConnected] = useState(initialMockConnectedState);
  const [streamBuffer, setStreamBuffer] = useState(""); // Used for real WebSocket streaming
  const conversationId = useRef(`conv_${Date.now()}`);

  const sendMessage = useCallback(
    (text: string) => {
      const patient = patientDatabase[currentPatientId]; // Get current patient context
      const newMessage: ChatMessage = { id: uuid(), sender: "user", text };

      // Update local messages and dispatch to Redux store immediately for user's message
      setMessages((prev) => [...prev, newMessage]);
      dispatch(addMessage(newMessage));
      console.log("[Chat] User message added to state:", newMessage);

      if (isMockActive && mockSendMessage) {
        // If mock is active, use the mockSendMessage function from the hook
        console.log("[Chat] Mock active, delegating to mockSendMessage.");
        mockSendMessage(text);
      } else {
        // Logic for sending message via real WebSocket
        if (!connected || !socketRef.current) {
          console.warn("[Chat] Real WebSocket not connected. Cannot send message.");
          // Optionally, queue the message or inform the user
          return;
        }
        const payload: any = {
          type: "chat",
          nurseId: testNurse.id,
          message: text,
          conversationId: conversationId.current,
          medspaId: testMedSpa.medspaId,
          medSpaContext: testMedSpa,
          streaming: true, // Request streaming from real backend
          cacheControl: { debug: cacheDebug, forceFresh },
          debug: { timestamp: new Date().toISOString() },
        };
        if (isPatientContextEnabled && patient) {
          payload.patientId = patient.id;
          payload.patientInfo = patient;
          payload.debug.activePatientContext = patient.id;
        }
        socketRef.current.send(JSON.stringify(payload));
        console.log("[Chat] Message sent to real WebSocket:", payload);
      }
    },
    [
      isMockActive,
      mockSendMessage,
      connected,
      currentPatientId,
      isPatientContextEnabled,
      dispatch, // dispatch is stable
      cacheDebug, // from props
      forceFresh, // from props
    ],
  ); // Dependencies for sendMessage

  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  useEffect(() => {
    if (isMockActive) {
      console.log(
        "[Chat] Client-side mock chat is ENABLED (via hook). Real WebSocket connection will be skipped.",
      );
      // Ensure 'connected' state is true if it wasn't set by initialMockConnectedState
      // This might happen if initialMockConnectedState was false but isMockActive became true later (unlikely with current setup)
      if (!connected) setConnected(true);
      return; // Skip WebSocket connection logic
    }

    // --- Real WebSocket Connection Logic (only if mock is not active) ---
    console.log("[Chat] Client-side mock chat is DISABLED. Attempting real WebSocket connection.");
    const connect = async () => {
      let token = "";
      try {
        const tokenResponse = await fetch("/api/token");
        if (!tokenResponse.ok) {
          console.error("Failed to fetch token:", tokenResponse.status, await tokenResponse.text());
          return;
        }
        const tokenData = await tokenResponse.json();
        token = tokenData.token;
        if (!token) {
          console.error("Token not found in response from /api/token");
          return;
        }
      } catch (error) {
        console.error("Error fetching token:", error);
        return;
      }

      const wsUrl = getWebSocketUrl();
      const url = new URL(wsUrl);
      url.searchParams.set("token", token);
      url.searchParams.set("medspaId", testMedSpa.medspaId);

      console.log("[Chat] Attempting to connect to real WebSocket:", url.toString());
      const socket = new WebSocket(url.toString());
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        retryCount.current = 0;
        if (retryTimeout.current) {
          clearTimeout(retryTimeout.current);
          retryTimeout.current = null;
        }
        socket.send(JSON.stringify({ type: "auth", token: token.replace(/^Bearer\s+/, "") }));
        console.log("[Chat] Real WebSocket connected and authenticated.");
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        const msg: WebSocketResponseMessage = JSON.parse(event.data);
        console.log("[Chat] Real WebSocket message received:", msg);
        switch (msg.type) {
          case "chat_stream_start":
            setLoading(true);
            setStreamBuffer("");
            break;
          case "chat_stream_chunk":
            setStreamBuffer((prev) => prev + extractChunk(msg.chunk));
            break;
          case "chat_stream_complete": {
            const rawAiResponseContent = msg.response?.content || streamBuffer;
            const actualBotMessage = getBotActualResponse(rawAiResponseContent); // Use the helper
            const streamMessage: ChatMessage = {
              id: uuid(),
              sender: "ai",
              text: sanitizeMarkdown(actualBotMessage),
            };
            setMessages((prev) => [...prev, streamMessage]);
            dispatch(addMessage(streamMessage));
            setLoading(false);
            setStreamBuffer("");
            logMetadata(msg.response?.metadata);
            if (actualBotMessage.trim()) {
              dispatch(fetchDynamicLayout(actualBotMessage));
            }
            break;
          }
          case "chat_response": {
            const rawAiResponseContent = msg.response?.content || "";
            const actualBotMessage = getBotActualResponse(rawAiResponseContent); // Use the helper
            const chatResMessage: ChatMessage = {
              id: uuid(),
              sender: "ai",
              text: extractChunk(actualBotMessage),
            };
            setMessages((prev) => [...prev, chatResMessage]);
            dispatch(addMessage(chatResMessage));
            setLoading(false);
            logMetadata(msg.response?.metadata);
            if (actualBotMessage.trim()) {
              dispatch(fetchDynamicLayout(actualBotMessage));
            }
            break;
          }
          case "error":
            setLoading(false);
            console.error("Real WebSocket Server Error:", msg.error);
            break;
          default:
            console.warn("Received unhandled real WebSocket message type:", msg.type);
        }
      };

      socket.onclose = (event: CloseEvent) => {
        setConnected(false);
        console.log("Real WebSocket closed:", event.code, event.reason);
        // Only retry if mock is not active and retries are not exhausted
        if (!isMockActive && retryCount.current < maxRetries) {
          retryCount.current += 1;
          console.log(
            `WebSocket connection closed. Retrying attempt ${retryCount.current}/${maxRetries} in ${retryDelay / 1000}s...`,
          );
          if (retryTimeout.current) clearTimeout(retryTimeout.current);
          retryTimeout.current = setTimeout(connect, retryDelay);
        } else if (!isMockActive) {
          console.error(`Real WebSocket connection failed after ${maxRetries} retries.`);
        }
      };
      socket.onerror = (errorEvent: WebSocket.ErrorEvent) => {
        console.error("Real WebSocket error observed:", errorEvent.message);
      };
    };

    connect(); // Initial connection attempt

    return () => {
      // Cleanup function
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
      if (socketRef.current) {
        console.log("Closing real WebSocket connection on component unmount/effect cleanup.");
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
        socketRef.current.close();
        socketRef.current = null;
      }
    };
    // Added isMockActive to the dependency array.
    // `dispatch` is stable. `connected` is managed internally.
  }, [
    isMockActive,
    currentPatientId,
    isPatientContextEnabled,
    forceFresh,
    cacheDebug,
    dispatch,
    connected,
    streamBuffer,
  ]);

  return {
    connected,
    messages,
    streamBuffer,
    loading,
    sendMessage,
  };
}
