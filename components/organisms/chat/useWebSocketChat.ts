// components/organisms/chat/useWebSocketChat.ts
import WebSocket from "isomorphic-ws";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

import { getWebSocketUrl } from "@/lib/getWebSocketUrl";
import type { AppDispatch } from "@/lib/store";
import { store } from "@/lib/store";

import { fetchDynamicLayout } from "@/lib/store/dynamicLayoutSlice";
import { UploadedFile, clear as clearFiles, selectAllFiles } from "@/lib/store/fileUploadsSlice";
import {
  selectPatientDatabase,
  selectTestMedSpa,
  selectTestNurse,
} from "@/lib/store/globalStateSlice";
import { Message as ReduxMessage, addMessage } from "@/lib/store/messagesSlice";
import { getActiveThreadId, updateThreadLastMessageAt } from "@/lib/store/threadsSlice";

import { sanitizeMarkdown } from "@/lib/utils";
import { useChatMockHandler } from "@/mock/mockTera/useChatMockHandler";
import { WebSocketResponseMessage } from "./types";
import { extractChunk, logMetadata } from "./utils";

interface UseChatWebSocketProps {
  currentPatientId: keyof ReturnType<typeof selectPatientDatabase>;
  isPatientContextEnabled: boolean;
  forceFresh: boolean;
  cacheDebug: boolean;
  activeThreadId: string; // Add activeThreadId
}

const tag = (t: string) => `%c[WS:${t}]`;
const blue = "color:#1e90ff;font-weight:bold";

export function useWebSocketChat({
  currentPatientId,
  isPatientContextEnabled,
  forceFresh,
  cacheDebug,
  activeThreadId,
}: UseChatWebSocketProps) {
  const dispatch = useDispatch<AppDispatch>();
  const patientDatabase = useSelector(selectPatientDatabase);
  const testMedSpa = useSelector(selectTestMedSpa);
  const testNurse = useSelector(selectTestNurse);

  const threadIdRef = useRef(activeThreadId);
  useEffect(() => {
    threadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  /* ---------------- local state ------------------------------- */
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");

  /* ---------------- socket & retry ---------------------------- */
  const socketRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const retryTimer = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const retryDelay = 2_000;

  /* ---------------- helper: File -> base64 -------------------- */
  const encodeFile = (file: File) =>
    new Promise<string>((ok, err) => {
      const r = new FileReader();
      r.onload = () => ok(String(r.result)); // data:…;base64,AAAA
      r.onerror = () => err(r.error);
      r.readAsDataURL(file);
    });

  /* ---------------- helper: stash AI message ------------------ */
  const stashAssistantMessage = (content: string, meta?: any) => {
    const cleaned = sanitizeMarkdown(content);
    const ai: ReduxMessage = {
      id: uuid(),
      threadId: threadIdRef.current,
      sender: "assistant",
      text: cleaned,
      createdAt: Date.now(),
    };
    dispatch(addMessage(ai));
    dispatch(
      updateThreadLastMessageAt({
        threadId: threadIdRef.current,
        timestamp: ai.createdAt,
      }),
    );
    if (cleaned.trim()) dispatch(fetchDynamicLayout(cleaned));
    logMetadata(meta);
  };

  /* ---------------- sendMessage ------------------------------- */
  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  const sendMessage = useCallback(
    async (text: string, _ignored?: UploadedFile[]) => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        console.warn(tag("WARN"), blue, "socket not open – abort send");
        return;
      }

      const files = selectAllFiles(store.getState());
      const hasDoc = files.length > 0;
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

      setLoading(true); // show spinner

      /* ------- plain chat ---------- */
      if (!hasDoc) {
        payload.message = text;
        console.log(tag("SEND"), blue, payload);
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
          base64Data: base64, // <-- NO “data:” prefix
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

      console.log(tag("SEND-DOC"), blue, payload);
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
      return;
    }
    if (!activeThreadId) {
      console.log(tag("PAUSE"), blue, "No activeThreadId");
      setConnected(false);
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
        console.log({ url });

        url.searchParams.set("token", token);
        url.searchParams.set("medspaId", testMedSpa.medspaId);

        console.log(tag("OPEN"), blue, url.toString());
        const ws = new WebSocket(url.toString());
        socketRef.current = ws;

        /* ---- open ------------------------------------------- */
        ws.onopen = () => {
          setConnected(true);
          retryCount.current = 0;
          retryTimer.current && clearTimeout(retryTimer.current);

          ws.send(
            JSON.stringify({
              type: "auth",
              token,
              medSpaId: testMedSpa.medspaId,
            }),
          );
          console.log(tag("OPEN"), blue, "auth sent");
        };

        /* ---- message ---------------------------------------- */
        ws.onmessage = (e: any) => {
          const msg: WebSocketResponseMessage = JSON.parse(e.data);
          console.log(tag("RX"), blue, msg.type, msg);

          switch (msg.type) {
            case "auth_success":
              console.log(tag("AUTH_OK"), blue);
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

        /* ---- close / error --------------------------------- */
        ws.onclose = (ev: any) => {
          console.log(tag("CLOSE"), blue, ev.code, ev.reason);
          setConnected(false);
          setLoading(false);
          if (retryCount.current < maxRetries) {
            retryCount.current++;
            retryTimer.current = setTimeout(connect, retryDelay);
          }
        };
        ws.onerror = (err: any) => console.error(tag("WS_ERR"), blue, err.message);
      } catch (err) {
        console.error(tag("BOOT_ERR"), blue, err);
      }
    };

    connect();

    return () => {
      retryTimer.current && clearTimeout(retryTimer.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [
    isMockActive,
    activeThreadId,
    cacheDebug,
    forceFresh,
    currentPatientId,
    isPatientContextEnabled,
    testMedSpa.medspaId,
  ]);

  const send = isMockActive
    ? (txt: string, _files?: unknown) => {
        /* always use current active thread id */
        if (mockSendMessage) mockSendMessage(txt, threadIdRef.current);
      }
    : sendMessage;

  return {
    connected,
    loading,
    streamBuffer,
    sendMessage: send,
  };
}
