import { getWebSocketUrl } from "@/lib/getWebSocketUrl";
import { addMessage } from "@/lib/store/messagesSlice";
import { sanitizeMarkdown } from "@/lib/utils";
import { patientDatabase, testMedSpa, testNurse } from "@/mock/chat.data";
import WebSocket from "isomorphic-ws";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";
import { ChatMessage, WebSocketResponseMessage } from "./types";
import { extractChunk, logMetadata } from "./utils";

import type { AppDispatch } from "@/lib/store";
// Import the async thunk for fetching dynamic layout
import { fetchDynamicLayout } from "@/lib/store/dynamicLayoutSlice";

interface UseChatWebSocketProps {
  currentPatientId: keyof typeof patientDatabase;
  isPatientContextEnabled: boolean;
  forceFresh: boolean;
  cacheDebug: boolean;
  onMessage?: (messages: ChatMessage[]) => void;
}

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

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Typed dispatch for use with thunks
  const dispatch = useDispatch<AppDispatch>();
  const [streamBuffer, setStreamBuffer] = useState("");
  const [loading, setLoading] = useState(false); // This loading is for chat messages, not layout
  const conversationId = useRef(`conv_${Date.now()}`);

  const sendMessage = (text: string) => {
    if (!connected || !socketRef.current) return;
    const patient = patientDatabase[currentPatientId];
    const newMessage: ChatMessage = { id: uuid(), sender: "user", text };
    setMessages((prev) => [...prev, newMessage]);
    dispatch(addMessage(newMessage));

    const payload: any = {
      type: "chat",
      nurseId: testNurse.id,
      message: text,
      conversationId: conversationId.current,
      medspaId: testMedSpa.medspaId,
      medSpaContext: testMedSpa,
      streaming: true, // Assuming you still want to request streaming for chat
      cacheControl: { debug: cacheDebug, forceFresh },
      debug: { timestamp: new Date().toISOString() },
    };

    if (isPatientContextEnabled && patient) {
      payload.patientId = patient.id;
      payload.patientInfo = patient;
      payload.debug.activePatientContext = patient.id;
    }

    socketRef.current.send(JSON.stringify(payload));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  useEffect(() => {
    const connect = async () => {
      // Ensure /api/token endpoint is available and returns a valid token structure
      let token = "";
      try {
        const tokenResponse = await fetch("/api/token");
        if (!tokenResponse.ok) {
          console.error("Failed to fetch token:", tokenResponse.status, await tokenResponse.text());
          // Handle token fetch failure (e.g., retry, show error)
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
        // Handle token fetch error
        return;
      }

      const url = new URL(getWebSocketUrl());
      url.searchParams.set("token", token);
      url.searchParams.set("medspaId", "MS-1001"); // Or use testMedSpa.medspaId

      const socket = new WebSocket(url.toString());
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        retryCount.current = 0;
        if (retryTimeout.current) {
          clearTimeout(retryTimeout.current);
          retryTimeout.current = null;
        }
        // Ensure token is not prefixed with "Bearer " if server expects raw token
        socket.send(JSON.stringify({ type: "auth", token: token.replace(/^Bearer\s+/, "") }));
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        const msg: WebSocketResponseMessage = JSON.parse(event.data);
        switch (msg.type) {
          case "chat_stream_start":
            setLoading(true);
            setStreamBuffer("");
            break;
          case "chat_stream_chunk":
            setStreamBuffer((prev) => prev + extractChunk(msg.chunk));
            break;
          case "chat_stream_complete": {
            const aiResponseContent = msg.response?.content || "";
            const streamMessage: ChatMessage = {
              id: uuid(),
              sender: "ai",
              text: sanitizeMarkdown(aiResponseContent),
            };
            setMessages((prev) => [...prev, streamMessage]);
            dispatch(addMessage(streamMessage));
            setLoading(false);
            setStreamBuffer("");
            logMetadata(msg.response?.metadata);

            // Dispatch action to fetch dynamic layout if content is present
            if (aiResponseContent.trim()) {
              console.log(
                "Dispatching fetchDynamicLayout from chat_stream_complete with markdown:",
                aiResponseContent,
              );
              dispatch(fetchDynamicLayout(aiResponseContent));
            }
            break;
          }
          case "chat_response": {
            const aiResponseContent = msg.response?.content || "";
            const chatResMessage: ChatMessage = {
              id: uuid(),
              sender: "ai",
              text: extractChunk(aiResponseContent), // extractChunk might be same as sanitizeMarkdown or simpler
            };
            setMessages((prev) => [...prev, chatResMessage]);
            dispatch(addMessage(chatResMessage));
            setLoading(false);
            logMetadata(msg.response?.metadata);

            // Dispatch action to fetch dynamic layout if content is present
            if (aiResponseContent.trim()) {
              console.log(
                "Dispatching fetchDynamicLayout from chat_response with markdown:",
                aiResponseContent,
              );
              dispatch(fetchDynamicLayout(aiResponseContent));
            }
            break;
          }
          case "error":
            setLoading(false);
            console.error("WebSocket Server Error:", msg.error);
            // Potentially display this error to the user
            break;
          // Handle other message types if any
          default:
            console.warn("Received unhandled WebSocket message type:", msg.type);
        }
      };

      socket.onclose = (event: any) => {
        setConnected(false);
        console.log("WebSocket closed:", event.code, event.reason);
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          console.log(
            `WebSocket connection closed. Retrying attempt ${retryCount.current}/${maxRetries} in ${retryDelay / 1000}s...`,
          );
          if (retryTimeout.current) clearTimeout(retryTimeout.current); // Clear any existing timeout
          retryTimeout.current = setTimeout(connect, retryDelay);
        } else {
          console.error(`WebSocket connection failed after ${maxRetries} retries.`);
          // Optionally inform the user that connection failed permanently
        }
      };

      socket.onerror = (errorEvent: WebSocket.ErrorEvent) => {
        console.error("WebSocket error observed:", errorEvent.message);
        // socket.close(); // Often, onerror is followed by onclose. Explicit close might be redundant or helpful.
      };
    };

    connect();

    // Cleanup function for useEffect
    return () => {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
      if (socketRef.current) {
        console.log("Closing WebSocket connection on component unmount/effect cleanup.");
        socketRef.current.close();
        socketRef.current = null;
      }
    };
    // Removed dispatch from dependencies as it's stable.
    // If other dependencies like getWebSocketUrl can change and require re-connection, they should be added.
  }, [currentPatientId, isPatientContextEnabled, forceFresh, cacheDebug]);

  return {
    connected,
    messages,
    streamBuffer,
    loading,
    sendMessage,
  };
}
