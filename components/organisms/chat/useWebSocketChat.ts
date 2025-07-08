// components/organisms/chat/useWebSocketChat.ts

"use client";

import WebSocket from "isomorphic-ws";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

import { getWebSocketUrl } from "@/lib/getWebSocketUrl";
import type { AppDispatch } from "@/lib/store";
import { store } from "@/lib/store";

import { fetchDynamicLayout } from "@/lib/store/slices/dynamicLayoutSlice";
import {
  UploadedFile,
  clear as clearFiles,
  selectAllFiles,
} from "@/lib/store/slices/fileUploadsSlice";
import {
  selectPatientDatabase,
  selectSelectedPatientId,
  selectTestMedSpa,
  selectTestNurse,
} from "@/lib/store/slices/globalStateSlice";
import { Message as ReduxMessage, addMessage } from "@/lib/store/slices/messagesSlice";
import { updateThreadLastMessageAt } from "@/lib/store/slices/threadsSlice";

import { sanitizeMarkdown } from "@/lib/utils";
import { useChatMockHandler } from "@/mock/mockTera/useChatMockHandler";
import { WebSocketResponseMessage } from "./types";
import { extractChunk, logMetadata } from "./utils";

interface UseChatWebSocketProps {
  isPatientContextEnabled: boolean;
  forceFresh: boolean;
  cacheDebug: boolean;
  activeThreadId: string;
}

const tag = (t: string) => `%c[WS:${t}]`;
const blue = "color:#1e90ff;font-weight:bold";

export function useWebSocketChat({
  isPatientContextEnabled,
  forceFresh,
  cacheDebug,
  activeThreadId,
}: UseChatWebSocketProps) {
  const dispatch = useDispatch<AppDispatch>();
  const patientDatabase = useSelector(selectPatientDatabase);
  const currentPatientId = useSelector(selectSelectedPatientId) as string;
  const testMedSpa = useSelector(selectTestMedSpa);
  const testNurse = useSelector(selectTestNurse);

  const threadIdRef = useRef(activeThreadId);
  useEffect(() => {
    threadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  /* ---------------- local state ------------------------------- */
  const [connected, setConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");

  /* ---------------- socket & retry ---------------------------- */
  const socketRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const retryTimer = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const retryDelay = 2_000;

  /* ---------------- helper: File -> base64 -------------------- */
  const encodeFile = useCallback(
    (file: File) =>
      new Promise<string>((ok, err) => {
        const r = new FileReader();
        r.onload = () => ok(String(r.result as string));
        r.onerror = (e) => err(r.error);
        r.readAsDataURL(file);
      }),
    [],
  );

  /* ---------------- helper: stash AI message ------------------ */
  const stashAssistantMessage = useCallback(
    (content: string, meta?: any) => {
      const cleaned = sanitizeMarkdown(content);
      const ai: ReduxMessage = {
        id: uuid(),
        threadId: threadIdRef.current,
        sender: "assistant",
        text: cleaned,
        createdAt: Date.now(),
      };
      if (cleaned.trim()) dispatch(fetchDynamicLayout(cleaned));
      dispatch(addMessage(ai));
      dispatch(
        updateThreadLastMessageAt({
          threadId: threadIdRef.current,
          timestamp: ai.createdAt,
        }),
      );
      logMetadata(meta);
    },
    [dispatch],
  );

  /* ---------------- sendMessage ------------------------------- */
  const sendMessage = useCallback(
    async (text: string, files?: UploadedFile[]) => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        console.warn(tag("WARN"), blue, "socket not open – abort send");
        return;
      }

      const hasDoc = files && files.length > 0;
      const convo = `${store.getState().threads.activeThreadId}_thread_${activeThreadId}`;

      const payload: any = {
        type: hasDoc ? "CHAT_WITH_DOCUMENT" : "chat",
        nurseId: testNurse.id,
        conversationId: convo,
        medspaId: testMedSpa.medspaId,
        medSpaContext: testMedSpa,
        streaming: true,
        cacheControl: { debug: cacheDebug, forceFresh },
      };

      const patient = patientDatabase[currentPatientId];
      if (isPatientContextEnabled && patient) {
        payload.patientId = patient.id;
        payload.patientInfo = patient;
      }

      setLoading(true);

      if (!hasDoc) {
        payload.message = text;
        socketRef.current.send(JSON.stringify(payload));
        return;
      }

      /* ------- chat + first file ---- */
      const file = files[0];
      const dataUrl = await encodeFile(file.file); // data:…;base64,xxx
      const base64 = dataUrl.includes(",") ? dataUrl.split(",", 2)[1] : dataUrl;

      payload.payload = {
        message: text || `Please analyze this document: ${file.name}`,
        document: {
          fileName: file.name,
          base64Data: base64,
          mimeType: file.file.type || "application/octet-stream",
          fileSize: file.file.size,
        },
        conversationId: convo,
        nurseId: testNurse.id,
        streaming: true,
        processingOptions: {
          maxFileSize: 10 * 1024 * 1024,
          sanitizeFileName: true,
          extractTextContent: true,
        },
      };

      socketRef.current.send(JSON.stringify(payload));
      dispatch(clearFiles());
    },
    [
      activeThreadId,
      cacheDebug,
      forceFresh,
      patientDatabase,
      currentPatientId,
      isPatientContextEnabled,
      testMedSpa,
      testNurse.id,
      dispatch,
      encodeFile,
    ],
  );

  /* ---------------- mock handler ------------------------------ */
  const { isMockActive, mockSendMessage, initialMockConnectedState } = useChatMockHandler({
    setLoading,
    currentPatientId,
    isPatientContextEnabled,
  });

  /* ---------------- connect / lifecycle ----------------------- */
  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  useEffect(() => {
    if (isMockActive) {
      setConnected(initialMockConnectedState);
      setIsAuthenticated(initialMockConnectedState);
      return;
    }
    if (!activeThreadId) {
      setConnected(false);
      setIsAuthenticated(false);
      socketRef.current?.close();
      socketRef.current = null;
      return;
    }

    const connect = async () => {
      try {
        /* ---- get JWT ---------------------------------------- */
        const tokRes = await fetch("/api/token");
        if (!tokRes.ok) throw new Error(`token api ${tokRes.status}`);
        const { token } = await tokRes.json();

        /* ---- open socket ------------------------------------ */
        const url = new URL(getWebSocketUrl());
        url.searchParams.set("token", token);
        url.searchParams.set("medspaId", testMedSpa.medspaId);

        const ws = new WebSocket(url.toString());
        socketRef.current = ws;

        /* ---- open ------------------------------------------- */
        ws.onopen = () => {
          setConnected(true);
          setIsAuthenticated(false); // Reset on new connection
          retryCount.current = 0;
          if (retryTimer.current) clearTimeout(retryTimer.current);
          const rawToken = token.replace("Bearer ", "");

          ws.send(
            JSON.stringify({
              type: "auth",
              token: rawToken,
              medSpaId: testMedSpa.medspaId,
            }),
          );
        };

        /* ---- message ---------------------------------------- */
        ws.onmessage = (e: any) => {
          const msg: WebSocketResponseMessage = JSON.parse(e.data);

          switch (msg.type) {
            case "auth_success":
              console.log(tag("AUTH_OK"), blue);
              setIsAuthenticated(true);
              break;

            /* ---------- chat streaming ---------------------- */
            case "chat_stream_start":
              setLoading(true);
              setStreamBuffer("");
              break;

            case "chat_stream_chunk":
              setStreamBuffer((prev) => prev + extractChunk(msg.chunk));
              break;

            case "chat_stream_complete":
              stashAssistantMessage(msg.response?.content || streamBuffer, msg.response?.metadata);
              setStreamBuffer("");
              setLoading(false);
              break;

            case "chat_stream_error":
              console.error(tag("STREAM_ERR"), blue, msg.error);
              setLoading(false);
              break;

            /* ---------- document upload -------------------- */
            case "DOCUMENT_ANALYSIS_CHUNK":
              setStreamBuffer((prev) => prev + extractChunk(msg.payload.chunk));
              break;

            case "DOCUMENT_UPLOAD_RESPONSE":
              if (msg.payload.success && msg.payload.message) {
                stashAssistantMessage(
                  msg.payload.message.content || streamBuffer,
                  msg.payload.message.metadata,
                );
              } else {
                console.error(tag("DOC_FAIL"), blue, msg.payload.error);
              }
              setStreamBuffer("");
              setLoading(false);
              break;

            case "DOCUMENT_UPLOAD_PROGRESS":
            case "DOCUMENT_VALIDATION_ERROR":
              // these can drive a separate progress UI if desired
              break;

            /* ---------- misc ------------------------------- */
            case "cache_control_response":
              break;

            case "error":
            case "auth_error":
              console.error(tag("ERROR"), blue, msg.error);
              setLoading(false);
              break;
            default:
              console.warn(tag("UNHANDLED"), blue, msg);
          }
        };

        ws.onclose = (ev: any) => {
          console.log(tag("CLOSE"), blue, ev.code, ev.reason);
          setConnected(false);
          setIsAuthenticated(false);
          setLoading(false);
          if (retryCount.current < maxRetries) {
            retryCount.current++;
            retryTimer.current = setTimeout(connect, retryDelay);
          }
        };
        ws.onerror = (err: any) => {
          console.error(tag("WS_ERR"), blue, err.message);
          setIsAuthenticated(false);
        };
      } catch (err) {
        console.error(tag("BOOT_ERR"), blue, err);
      }
    };

    connect();

    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [isMockActive, activeThreadId, testMedSpa.medspaId, stashAssistantMessage]);

  const send = isMockActive
    ? (txt: string, files?: UploadedFile[]) => {
        if (mockSendMessage) mockSendMessage(txt, threadIdRef.current);
      }
    : sendMessage;

  return {
    connected,
    isAuthenticated,
    loading,
    streamBuffer,
    sendMessage: send,
  };
}
