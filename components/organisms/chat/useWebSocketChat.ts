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

/**
 * Extracts the actual message content after a "Bot: " marker.
 * If the marker is not found, returns the original content.
 * @param rawContent The raw string content from the AI response.
 * @returns The processed string.
 */
const getBotActualResponse = (rawContent: string): string => {
  const botMarker = "Bot: ";
  const markerIndex = rawContent.indexOf(botMarker);
  if (markerIndex !== -1) {
    return rawContent.substring(markerIndex + botMarker.length).trim();
  }
  // Fallback: If "Bot: " isn't found, return the original content,
  // assuming it might sometimes be directly the message or already processed.
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
      streaming: true,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignored
  useEffect(() => {
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

      const url = new URL(getWebSocketUrl());
      url.searchParams.set("token", token);
      url.searchParams.set("medspaId", testMedSpa.medspaId);

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
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        const msg: WebSocketResponseMessage = JSON.parse(event.data);
        switch (msg.type) {
          case "chat_stream_start":
            setLoading(true);
            setStreamBuffer("");
            break;
          case "chat_stream_chunk":
            // For streaming, we assume the "Bot: " prefix would appear at the beginning of the stream.
            // If it's chunked, the prefix might be in the first chunk.
            // This logic might need refinement if "Bot: " can appear mid-stream or after some initial non-bot text.
            // For now, we'll apply getBotActualResponse to the accumulated streamBuffer at chat_stream_complete.
            setStreamBuffer((prev) => prev + extractChunk(msg.chunk));
            break;
          case "chat_stream_complete": {
            // Process the full accumulated stream buffer
            const rawAiResponseContent = msg.response?.content || streamBuffer; // Use response.content if available, else accumulated buffer
            const actualBotMessage = getBotActualResponse(rawAiResponseContent);

            const streamMessage: ChatMessage = {
              id: uuid(),
              sender: "ai",
              text: sanitizeMarkdown(actualBotMessage), // Use processed message for display
            };
            setMessages((prev) => [...prev, streamMessage]);
            dispatch(addMessage(streamMessage));
            setLoading(false);
            setStreamBuffer(""); // Clear buffer after processing
            logMetadata(msg.response?.metadata);

            // Dispatch action to fetch dynamic layout with the processed bot message
            if (actualBotMessage.trim()) {
              console.log(
                "Dispatching fetchDynamicLayout from chat_stream_complete with processed markdown:",
                actualBotMessage,
              );
              dispatch(fetchDynamicLayout(actualBotMessage));
            }
            break;
          }
          case "chat_response": {
            const rawAiResponseContent = msg.response?.content || "";
            const actualBotMessage = getBotActualResponse(rawAiResponseContent);

            const chatResMessage: ChatMessage = {
              id: uuid(),
              sender: "ai",
              text: extractChunk(actualBotMessage), // Use processed message for display
            };
            setMessages((prev) => [...prev, chatResMessage]);
            dispatch(addMessage(chatResMessage));
            setLoading(false);
            logMetadata(msg.response?.metadata);

            // Dispatch action to fetch dynamic layout with the processed bot message
            if (actualBotMessage.trim()) {
              console.log(
                "Dispatching fetchDynamicLayout from chat_response with processed markdown:",
                actualBotMessage,
              );
              dispatch(fetchDynamicLayout(actualBotMessage));
            }
            break;
          }
          case "error":
            setLoading(false);
            console.error("WebSocket Server Error:", msg.error);
            break;
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
          if (retryTimeout.current) clearTimeout(retryTimeout.current);
          retryTimeout.current = setTimeout(connect, retryDelay);
        } else {
          console.error(`WebSocket connection failed after ${maxRetries} retries.`);
        }
      };

      socket.onerror = (errorEvent: WebSocket.ErrorEvent) => {
        console.error("WebSocket error observed:", errorEvent.message);
      };
    };

    connect();

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
  }, [currentPatientId, isPatientContextEnabled, forceFresh, cacheDebug, dispatch]); // Added dispatch to dependency array

  return {
    connected,
    messages,
    streamBuffer, // Still expose streamBuffer if UI needs to show raw stream before "Bot:" processing
    loading,
    sendMessage,
  };
}
