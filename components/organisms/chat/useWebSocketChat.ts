import { getWebSocketUrl } from "@/lib/getWebSocketUrl";
import { sanitizeMarkdown } from "@/lib/utils";
import { patientDatabase, testMedSpa, testNurse } from "@/mock/chat.data";
import WebSocket from "isomorphic-ws";
import { useEffect, useRef, useState } from "react";
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
  const [streamBuffer, setStreamBuffer] = useState("");
  const [loading, setLoading] = useState(false);
  const conversationId = useRef(`conv_${Date.now()}`);

  const sendMessage = (text: string) => {
    if (!connected || !socketRef.current) return;
    const patient = patientDatabase[currentPatientId];
    setMessages((prev) => [...prev, { id: uuid(), sender: "user", text }]);

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
          case "chat_stream_complete":
            setMessages((prev) => [
              ...prev,
              { id: uuid(), sender: "ai", text: sanitizeMarkdown(msg.response?.content || "") },
            ]);
            setLoading(false);
            setStreamBuffer("");
            logMetadata(msg.response?.metadata);
            break;
          case "chat_response":
            setMessages((prev) => [
              ...prev,
              { id: uuid(), sender: "ai", text: extractChunk(msg.response?.content) },
            ]);
            setLoading(false);
            logMetadata(msg.response?.metadata);
            break;
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
