// components/organisms/chat/useWebSocketChat.ts

"use client";

import WebSocket from "isomorphic-ws";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

import { isFeatureEnabled } from "@/lib/featureFlags";
import { getWebSocketUrl } from "@/lib/getWebSocketUrl";
import type { AppDispatch } from "@/lib/store";
import { store } from "@/lib/store";

import { fetchDynamicLayout } from "@/lib/store/slices/dynamicLayoutSlice";
import {
  UploadedFile,
  clear as clearFiles,
  clearSearchResults,
  selectAllFiles,
  selectDocumentFilesByThread,
  setSearchResults,
  setSearching,
} from "@/lib/store/slices/fileUploadsSlice";
import {
  selectPatientDatabase,
  selectTestMedSpa,
  selectTestNurse,
} from "@/lib/store/slices/globalStateSlice";
import { Message as ReduxMessage, addMessage } from "@/lib/store/slices/messagesSlice";
import {
  selectActiveThreadPatientId,
  // New imports for thread-based classification and patient management
  selectNeedsFirstQueryEnhancement,
  selectThreadClassification,
  setThreadClassification,
  updateThreadLastMessageAt,
} from "@/lib/store/slices/threadsSlice";

import { uploadAndSearch } from "@/lib/api/files";
import type { SearchResult } from "@/lib/api/files";
import { sanitizeMarkdown } from "@/lib/utils";
import { useChatMockHandler } from "@/mock/mockTera/useChatMockHandler";
import { logValidationEvent } from "@/utils/responseValidator";
import { WebSocketResponseMessage } from "./types";
import { extractChunk, logMetadata } from "./utils";

interface UseChatWebSocketProps {
  isPatientContextEnabled: boolean;
  forceFresh: boolean;
  cacheDebug: boolean;
  activeThreadId: string;
  onPatientSelectionRequired?: (message: string, files?: UploadedFile[]) => void;
}

const tag = (t: string) => `%c[WS:${t}]`;
const blue = "color:#1e90ff;font-weight:bold";

export function useWebSocketChat({
  isPatientContextEnabled,
  forceFresh,
  cacheDebug,
  activeThreadId,
  onPatientSelectionRequired,
}: UseChatWebSocketProps) {
  const dispatch = useDispatch<AppDispatch>();
  const patientDatabase = useSelector(selectPatientDatabase);

  // Use thread-specific patient ID (removed mock patient logic)
  const currentPatientId = useSelector((state: any) =>
    selectActiveThreadPatientId(state),
  ) as string;

  const testMedSpa = useSelector(selectTestMedSpa);
  const testNurse = useSelector(selectTestNurse);

  const threadIdRef = useRef(activeThreadId);
  useEffect(() => {
    threadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  /* ---------------- Redux selectors for thread classification - */
  // CHANGED: Use thread-specific selectors instead of threadClassificationsSlice
  const threadClassification = useSelector((state: any) =>
    selectThreadClassification(state, activeThreadId),
  );
  const needsFirstQueryEnhancement = useSelector((state: any) =>
    selectNeedsFirstQueryEnhancement(state, activeThreadId),
  );

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
      if (cleaned.trim() && isFeatureEnabled("dynamicLayout")) {
        dispatch(fetchDynamicLayout(cleaned));
      }
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

  /* ---------------- helper: handle patient selection required - */
  const handlePatientSelectionRequired = useCallback(
    (text: string, files?: UploadedFile[]) => {
      console.log("FRONTEND_VALIDATION: Patient selection required", {
        query: text.substring(0, 50) + "...",
        threadId: activeThreadId,
      });

      // Log validation event (scope will be determined by API)
      logValidationEvent(
        "BLOCKED",
        text,
        {
          activePatientId: currentPatientId,
          conversationScope: "patient" as any, // Default assumption for blocked queries
          threadId: activeThreadId,
        },
        "Patient selection required",
      );

      // Trigger the callback if provided
      if (onPatientSelectionRequired) {
        onPatientSelectionRequired(text, files);
      }
    },
    [activeThreadId, currentPatientId, onPatientSelectionRequired],
  );

  /* ---------------- helper: call query classifier API -------- */
  const classifyQueryViaAPI = useCallback(
    async (text: string, files?: UploadedFile[]) => {
      try {
        const messagesState = store.getState().messages;
        const existingMessages = messagesState.items.filter(
          (msg) => msg.threadId === activeThreadId,
        );

        const response = await fetch("/api/queryClassifier", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            threadId: activeThreadId,
            sessionAttributes: {
              activePatientId: currentPatientId,
              providerId: testNurse?.id,
              medspaId: testMedSpa?.medspaId,
              threadId: activeThreadId,
            },
            existingMessages,
            files,
          }),
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`);
        }

        const result = await response.json();
        console.log("API_QUERY_CLASSIFIER: Received response", result);

        return result;
      } catch (error) {
        console.error("API_QUERY_CLASSIFIER: Request failed", error);
        // Fallback to allowing the query through
        return {
          action: "PROCEED",
          classification: { scope: "provider", requiresPatient: false, confidence: 0.3 },
          shouldEnhance: false,
        };
      }
    },
    [activeThreadId, currentPatientId, testNurse, testMedSpa],
  );

  /* ---------------- sendMessage ------------------------------- */
  const sendMessage = useCallback(
    async (text: string, files?: UploadedFile[]) => {
      console.log("[SendMessage-01] Initiating message send", { text, files });

      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        console.warn(tag("WARN"), blue, "socket not open – abort send");
        return;
      }

      let messageText = text;
      let currentClassification = threadClassification;
      let documentChunks: SearchResult[] = [];

      if (files && files.length > 0) {
        console.log("[SendMessage-02] File detected, starting upload and search process");
        const file = files[0];
        const searchResult = await uploadAndSearch(file.file, text);
        console.log("[SendMessage-03] Received search result from API", { searchResult });

        if (searchResult.success && searchResult.results && searchResult.results.length > 0) {
          documentChunks = searchResult.results;
          const documentContext = formatDocumentContext(searchResult.results);
          messageText = `${text}\n\n---\n**Document Context:**\n${documentContext}`;
          console.log("[SendMessage-04] Enriched message with document context");
        } else {
          console.log("[SendMessage-05] No relevant content found in uploaded documents");
        }
      }

      // Continue with existing classification logic...
      if (needsFirstQueryEnhancement) {
        console.log(`[SendMessage-06] Calling classifier for thread ${activeThreadId}`);
        const apiResult = await classifyQueryViaAPI(text, files);
        console.log("[SendMessage-07] Received classification result", { apiResult });

        if (apiResult.action === "REQUEST_PATIENT_SELECTION") {
          return handlePatientSelectionRequired(text, files);
        }

        currentClassification = apiResult.classification;
        dispatch(
          setThreadClassification({
            threadId: activeThreadId,
            // @ts-ignore
            scope: currentClassification.scope,
            // @ts-ignore
            requiresPatient: currentClassification.requiresPatient,
            // @ts-ignore
            confidence: currentClassification.confidence,
          }),
        );

        if (apiResult.enhancedQuery) {
          const hasDocumentContext = messageText.includes("Document Context:");
          messageText = hasDocumentContext
            ? messageText.replace(text, apiResult.enhancedQuery)
            : apiResult.enhancedQuery;
          console.log("[SendMessage-08] Enhanced message with query from classifier");
        }

        console.log("[SendMessage-09] Thread classified and enhanced", {
          threadId: activeThreadId,
          // @ts-ignore
          scope: currentClassification.scope,
          enhanced: !!apiResult.enhancedQuery,
          hasDocuments: files && files.length > 0,
          originalLength: text.length,
          enhancedLength: messageText.length,
        });
      } else {
        console.log("[SendMessage-10] Using stored classification", {
          threadId: activeThreadId,
          scope: currentClassification?.scope,
          requiresPatient: currentClassification?.requiresPatient,
          hasDocuments: files && files.length > 0,
        });

        if (currentClassification?.requiresPatient && !currentPatientId) {
          return handlePatientSelectionRequired(text, files);
        }
      }

      logValidationEvent("ALLOWED", text, {
        activePatientId: currentPatientId,
        conversationScope: currentClassification?.scope as any,
        threadId: activeThreadId,
      });

      const hasDoc = files && files.length > 0;
      const convo = `${store.getState().threads.activeThreadId}_thread_${activeThreadId}`;

      const payload: any = {
        type: "chat",
        nurseId: testNurse.id,
        conversationId: convo,
        medspaId: testMedSpa.medspaId,
        medSpaContext: testMedSpa,
        streaming: true,
        cacheControl: { debug: cacheDebug, forceFresh },
        sessionAttributes: {
          activePatientId: currentPatientId,
          providerId: testNurse?.id,
          medspaId: testMedSpa?.medspaId,
          conversationScope: currentClassification?.scope,
          threadId: activeThreadId,
          queryEnhanced: needsFirstQueryEnhancement,
          classification: currentClassification,
          hasDocumentContext: files && files.length > 0,
          documentCount: files?.length || 0,
          documentChunks,
        },
      };

      const patient = patientDatabase[currentPatientId];
      if (isPatientContextEnabled && patient) {
        payload.patientId = patient.id;
        payload.patientInfo = patient;
      }

      setLoading(true);

      payload.message = messageText;

      console.log("[SendMessage-11] Sending payload to WebSocket", { payload });
      socketRef.current.send(JSON.stringify(payload));

      if (hasDoc) {
        dispatch(clearFiles());
      }
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
      handlePatientSelectionRequired,
      classifyQueryViaAPI,
      needsFirstQueryEnhancement,
      threadClassification,
    ],
  );

  // Helper function to format document context
  const formatDocumentContext = (results: SearchResult[]): string => {
    if (results.length === 0) return "";

    return results
      .map((result, index) => {
        return `**Section ${result.metadata.chunkIndex + 1}:**\n${result.content.trim()}\n\n*Relevance Score: ${(result.score * 100).toFixed(1)}%*`;
      })
      .join("\n\n---\n\n");
  };

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
        if (!tokRes) throw new Error(`token api ${tokRes.status}`);
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
    // @TODO: Remove this after removing the Mock Data.
  }, [isMockActive, testMedSpa.medspaId]); // FIXED: Removed stashAssistantMessage to prevent reconnection

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
