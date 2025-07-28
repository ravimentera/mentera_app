// components/organisms/chat/ChatClient.tsx
"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { Thread } from "@/components/organisms/Thread";
import { ChatTopbar } from "./ChatTopbar";
import { TeraRuntimeProvider } from "./TeraRuntimeProvider";
import { ThreadListDrawer } from "./ThreadListDrawer";

import type { AppDispatch, RootState } from "@/lib/store";
import { clear as clearFiles } from "@/lib/store/slices/fileUploadsSlice";
import { selectPatientDatabase } from "@/lib/store/slices/globalStateSlice";
import { loadMessages } from "@/lib/store/slices/messagesSlice";
import {
  addThread,
  clearThreadPatient,
  loadThreads,
  selectActiveThreadPatientId,
  setActiveThreadId,
  setThreadPatient,
} from "@/lib/store/slices/threadsSlice";

// @TODO: Remove this after removing the Mock Data.
// Helper function to check if a patient ID is from mock data
const isMockPatientId = (patientId: string): boolean => {
  return patientId.startsWith("PT-") && patientId.length <= 7; // Mock IDs like "PT-1003"
};

export default function ChatClient() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();

  // Redux state
  const { threads, activeThreadId } = useSelector((s: RootState) => s.threads);
  const messages = useSelector((s: RootState) => s.messages.items);

  // CHANGED: Use thread-specific patient ID instead of global
  const selectedId = useSelector(selectActiveThreadPatientId);
  // @TODO: Remove this after removing the Mock Data.
  const patientDB = useSelector(selectPatientDatabase);
  const defaultPatientId = Object.keys(patientDB)[0] as string;

  // FIXED: Don't auto-assign mock patients for real API calls
  // Only use currentPatientId for UI display, not for actual API calls
  const currentPatientId = selectedId ?? defaultPatientId;

  // Local UI state
  const [isPatientContextEnabled, setIsPatientContextEnabled] = useState(true);
  const [forceFresh, setForceFresh] = useState(false);
  const [cacheDebug, setCacheDebug] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load persisted threads & messages once
  const hasLoaded = useRef(false);

  // FIXED: Only set default patient for UI display, not for API calls
  // Don't auto-assign mock patients that would trigger real API calls
  useEffect(() => {
    if (!selectedId && activeThreadId && defaultPatientId) {
      // Check if this is a mock patient ID that shouldn't be used for real API calls
      if (isMockPatientId(defaultPatientId)) {
        console.warn(
          `[ChatClient] Skipping auto-assignment of mock patient ${defaultPatientId} to avoid API errors`,
        );
        return;
      }

      const defaultPatient = patientDB[defaultPatientId];
      if (defaultPatient) {
        dispatch(
          setThreadPatient({
            threadId: activeThreadId,
            // @ts-ignore
            patient: defaultPatient,
          }),
        );
      }
    }
  }, [selectedId, activeThreadId, defaultPatientId, patientDB, dispatch]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    try {
      const ts = localStorage.getItem("chatThreads");
      if (ts) dispatch(loadThreads(JSON.parse(ts)));

      const ms = localStorage.getItem("chatMessages");
      if (ms) dispatch(loadMessages(JSON.parse(ms)));
    } catch {
      localStorage.removeItem("chatThreads");
      localStorage.removeItem("chatMessages");
    }
  }, [dispatch]);

  useEffect(() => {
    if (threads.length) {
      requestAnimationFrame(() => localStorage.setItem("chatThreads", JSON.stringify(threads)));
    }
  }, [threads]);

  useEffect(() => {
    if (messages.length) {
      requestAnimationFrame(() => localStorage.setItem("chatMessages", JSON.stringify(messages)));
    }
  }, [messages]);

  // Create a default thread if none exist
  const defaultThreadCreated = useRef(false);
  useEffect(() => {
    if (!defaultThreadCreated.current && hasLoaded.current && threads.length === 0) {
      defaultThreadCreated.current = true;
      dispatch(
        addThread({
          id: uuidv4(),
          name: "General Chat",
          activate: true,
        }),
      );
    }
  }, [threads.length, dispatch]);

  // Auto-select thread if none is active
  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      dispatch(setActiveThreadId(threads[threads.length - 1].id));
    }
  }, [activeThreadId, threads, dispatch]);

  return (
    <div className="flex h-full w-full bg-white dark:bg-slate-900">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Hide ChatTopbar when on /home route */}
        {pathname !== "/home" && (
          <ChatTopbar
            onOpenDrawer={() => setDrawerOpen(true)}
            currentPatientId={currentPatientId}
            setCurrentPatientId={(patientId) => {
              // FIXED: Prevent assignment of mock patient IDs that would cause API errors
              const isMockId = patientId.startsWith("PT-") && patientId.length <= 7;
              if (isMockId) {
                console.warn(
                  `[ChatClient] Preventing assignment of mock patient ${patientId} to avoid API errors`,
                );
                return;
              }

              // CHANGED: Set patient for current thread instead of global
              if (activeThreadId) {
                const patient = patientDB[patientId];
                if (patient) {
                  dispatch(
                    setThreadPatient({
                      threadId: activeThreadId,
                      // @ts-ignore
                      patient,
                    }),
                  );
                }
              }
            }}
            isPatientContextEnabled={isPatientContextEnabled}
            setIsPatientContextEnabled={setIsPatientContextEnabled}
            forceFresh={forceFresh}
            setForceFresh={setForceFresh}
            cacheDebug={cacheDebug}
            setCacheDebug={setCacheDebug}
          />
        )}

        {activeThreadId ? (
          <TeraRuntimeProvider
            activeThreadId={activeThreadId}
            isPatientContextEnabled={isPatientContextEnabled}
            forceFresh={forceFresh}
            cacheDebug={cacheDebug}
          >
            <ThreadListDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

            <div className="flex-1 min-h-0 overflow-hidden">
              <Thread />
            </div>
          </TeraRuntimeProvider>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-slate-500">
            Select a chat or create a new one.
          </div>
        )}
      </div>
    </div>
  );
}
