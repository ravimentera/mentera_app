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
  const dispatch = useDispatch(); // @TODO: Need to verify whether Messages are saved to Redux or not.
  const [streamBuffer, setStreamBuffer] = useState("");
  const [loading, setLoading] = useState(false);
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  useEffect(() => {
    const connect = async () => {
      const { token } = await fetch("/api/token").then((r) => r.json());
      const url = new URL(getWebSocketUrl());
      url.searchParams.set("token", token);
      url.searchParams.set("medspaId", "MS-1001");

      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        retryCount.current = 0;
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
            const streamMessage: ChatMessage = {
              id: uuid(),
              sender: "ai",
              text: sanitizeMarkdown(msg.response?.content || ""),
            };
            setMessages((prev) => [...prev, streamMessage]);
            dispatch(addMessage(streamMessage));
            setLoading(false);
            setStreamBuffer("");
            logMetadata(msg.response?.metadata);
            break;
          }
          case "chat_response": {
            const chatResMessage: ChatMessage = {
              id: uuid(),
              sender: "ai",
              text: extractChunk(msg.response?.content),
            };
            setMessages((prev) => [...prev, chatResMessage]);
            dispatch(addMessage(chatResMessage));
            setLoading(false);
            logMetadata(msg.response?.metadata);
            break;
          }
          case "error":
            setLoading(false);
            console.error("Error:", msg.error);
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          retryTimeout.current = setTimeout(connect, retryDelay);
        }
      };

      socket.onerror = (e: any) => {
        console.error("WebSocket error", e);
      };
    };

    connect();
  }, [currentPatientId, isPatientContextEnabled, forceFresh, cacheDebug]);

  return {
    connected,
    messages,
    streamBuffer,
    loading,
    sendMessage,
  };
}
