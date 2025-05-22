// components/organisms/chat/useWebSocketChat.ts
import { getWebSocketUrl } from "@/lib/getWebSocketUrl";
import type { AppDispatch } from "@/lib/store";
import { fetchDynamicLayout } from "@/lib/store/dynamicLayoutSlice";
import { Message as ReduxMessage, addMessage } from "@/lib/store/messagesSlice";
import { updateThreadLastMessageAt } from "@/lib/store/threadsSlice";
import { sanitizeMarkdown } from "@/lib/utils";
import { patientDatabase, testMedSpa, testNurse } from "@/mock/chat.data";
import { useChatMockHandler } from "@/mock/mockTera/useChatMockHandler";
import WebSocket from "isomorphic-ws";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";
import { WebSocketResponseMessage } from "./types";
import { extractChunk, logMetadata } from "./utils";

interface UseChatWebSocketProps {
  currentPatientId: keyof typeof patientDatabase;
  isPatientContextEnabled: boolean;
  forceFresh: boolean;
  cacheDebug: boolean;
  activeThreadId: string; // Add activeThreadId
  // onMessage?: (messages: ReduxMessage[]) => void; // This was for local state, likely not needed if Redux is sole source
}

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
  activeThreadId, // Receive activeThreadId
}: UseChatWebSocketProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const retryDelay = 2000;
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<ReduxMessage[]>([]); // Local messages state might be redundant
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  /* inside useWebSocketChat() */
  const threadIdRef = useRef(activeThreadId);
  useEffect(() => {
    threadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  const {
    isMockActive,
    initialMockConnectedState,
    mockSendMessage: originalMockSendMessage,
  } = useChatMockHandler({
    setMessages, // If you remove local messages state, this is not needed by mock handler directly
    // The mock handler would need to dispatch to Redux if it creates messages
    // For simplicity, let's assume mock handler is adapted or its setMessages is for its internal use only
    setLoading,
    currentPatientId,
    isPatientContextEnabled,
  });

  const [connected, setConnected] = useState(initialMockConnectedState);
  const [streamBuffer, setStreamBuffer] = useState("");
  const conversationId = useRef(`conv_${Date.now()}`); // This might need to be per-thread or managed differently

  // sendMessage now only takes text, as activeThreadId is available from props
  const sendMessage = useCallback(
    (text: string) => {
      if (!activeThreadId) {
        console.warn("[Chat] No active thread. Cannot send message.");
        return;
      }

      // User message is already added optimistically by TeraRuntimeProvider's onNew
      // This hook's sendMessage is now primarily for triggering the WebSocket call.
      // And for the mock handler.

      console.log(`[Chat] sendMessage called for thread ${activeThreadId} with text: ${text}`);

      if (isMockActive && originalMockSendMessage) {
        console.log("[Chat] Mock active, delegating to mockSendMessage.");
        // Adapt mockSendMessage if it needs to know about threadId or dispatch Redux actions
        originalMockSendMessage(text, activeThreadId); // Pass activeThreadId if mock needs it
      } else {
        if (!connected || !socketRef.current) {
          console.warn("[Chat] Real WebSocket not connected. Cannot send message.");
          return;
        }
        const patient = patientDatabase[currentPatientId];
        const payload: any = {
          type: "chat",
          nurseId: testNurse.id,
          message: text,
          conversationId: `${conversationId.current}_thread_${activeThreadId}`, // Make conversationId thread-specific
          medspaId: testMedSpa.medspaId,
          medSpaContext: testMedSpa,
          streaming: true,
          cacheControl: { debug: cacheDebug, forceFresh },
          debug: { timestamp: new Date().toISOString(), activeThreadId },
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
      activeThreadId, // Add activeThreadId to dependencies
      isMockActive,
      originalMockSendMessage,
      connected,
      currentPatientId,
      isPatientContextEnabled,
      // dispatch, // dispatch is stable
      cacheDebug,
      forceFresh,
      // conversationId.current // if conversationId is dynamic per thread
    ],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  useEffect(() => {
    if (isMockActive) {
      console.log(
        "[Chat] Client-side mock chat is ENABLED. Real WebSocket connection will be skipped.",
      );
      if (!connected) setConnected(true); // Ensure connected state for mock
      return;
    }
    if (!activeThreadId) {
      console.log("[Chat] No active thread, WebSocket connection paused.");
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnected(false);
      return; // Don't connect if no active thread
    }

    console.log(`[Chat] Attempting real WebSocket connection for thread: ${activeThreadId}`);
    const connect = async () => {
      // ... (token fetching logic remains the same)
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
      // Potentially add threadId to WebSocket connection if backend needs it per-connection
      // url.searchParams.set("threadId", activeThreadId);

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

        const processAndDispatchAiMessage = (content: string) => {
          if (!activeThreadId) return; // Should not happen if connection depends on activeThreadId
          const actualBotMessage = getBotActualResponse(content);
          const aiMessage: ReduxMessage = {
            id: uuid(),
            // threadId: activeThreadId,
            threadId: threadIdRef.current,
            sender: "assistant", // ← must be exactly this
            text: String(actualBotMessage), // ← force plain string now
            createdAt: Date.now(),
          };
          // setMessages((prev) => [...prev, aiMessage]); // Remove if not using local state
          dispatch(addMessage(aiMessage));
          dispatch(
            updateThreadLastMessageAt({ threadId: activeThreadId, timestamp: aiMessage.createdAt }),
          );
          setLoading(false);
          if (actualBotMessage.trim()) {
            dispatch(fetchDynamicLayout(actualBotMessage));
          }
        };

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
            processAndDispatchAiMessage(rawAiResponseContent);
            setStreamBuffer(""); // Clear buffer after processing
            logMetadata(msg.response?.metadata);
            break;
          }
          case "chat_response": {
            // Non-streaming response
            const rawAiResponseContent = msg.response?.content || "";
            processAndDispatchAiMessage(rawAiResponseContent);
            logMetadata(msg.response?.metadata);
            break;
          }
          case "error":
            setLoading(false);
            console.error("Real WebSocket Server Error:", msg.error);
            // Potentially dispatch an error message to the thread
            break;
          default:
            console.warn("Received unhandled real WebSocket message type:", msg.type);
        }
      };

      socket.onclose = (event: CloseEvent) => {
        setConnected(false);
        console.log("Real WebSocket closed:", event.code, event.reason);
        if (!isMockActive && activeThreadId && retryCount.current < maxRetries) {
          // Only retry if there was an active thread
          retryCount.current += 1;
          console.log(
            `WebSocket connection closed. Retrying attempt ${retryCount.current}/${maxRetries} in ${retryDelay / 1000}s...`,
          );
          if (retryTimeout.current) clearTimeout(retryTimeout.current);
          retryTimeout.current = setTimeout(connect, retryDelay);
        } else if (!isMockActive && activeThreadId) {
          console.error(
            `Real WebSocket connection failed after ${maxRetries} retries for thread ${activeThreadId}.`,
          );
        }
      };
      socket.onerror = (errorEvent: WebSocket.ErrorEvent) => {
        console.error("Real WebSocket error observed:", errorEvent.message);
      };
    };

    connect();

    return () => {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
      if (socketRef.current) {
        console.log("Closing real WebSocket connection on component unmount/effect cleanup.");
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null; // Important to nullify to prevent calls on old socket instances
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [
    isMockActive,
    activeThreadId, // WebSocket connection now depends on activeThreadId
    // currentPatientId, // These are used inside connect() or sendMessage(), not direct deps for connection effect
    // isPatientContextEnabled,
    // forceFresh,
    // cacheDebug,
    dispatch, // dispatch is stable
    // connected, // Internal state, not a dependency for re-running the effect that sets it up
  ]);

  return {
    connected,
    // messages, // Removed, as Redux is the source of truth via TeraRuntimeProvider
    streamBuffer, // Still useful for streaming UI if you build chunks manually before dispatching full message
    loading,
    sendMessage,
  };
}
