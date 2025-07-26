// components/organisms/chat/ChatClient.tsx
"use client";

import { Edit, PanelLeft, Search } from "lucide-react";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/atoms";
import { Input } from "@/components/atoms/Input";
import { Tooltip } from "@/components/atoms/Tooltip";
import { Thread } from "@/components/organisms/Thread";
import { ChatTopbar } from "./ChatTopbar";
import { TeraRuntimeProvider } from "./TeraRuntimeProvider";
import { ThreadListDrawer } from "./ThreadListDrawer";

import type { AppDispatch, RootState } from "@/lib/store";
import { clear as clearFiles } from "@/lib/store/slices/fileUploadsSlice";
import {
  selectIsChatSidebarOpen,
  selectPatientDatabase,
  setIsChatSidebarOpen,
} from "@/lib/store/slices/globalStateSlice";
import { loadMessages } from "@/lib/store/slices/messagesSlice";
import {
  addThread,
  clearThreadPatient,
  loadThreads,
  selectActiveThreadPatientId,
  setActiveThreadId,
  setThreadPatient,
} from "@/lib/store/slices/threadsSlice";
import { cn } from "@/lib/utils";

// @TODO: Remove this after removing the Mock Data.
// Helper function to check if a patient ID is from mock data
const isMockPatientId = (patientId: string): boolean => {
  return patientId.startsWith("PT-") && patientId.length <= 7; // Mock IDs like "PT-1003"
};

export default function ChatClient() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { threads, activeThreadId } = useSelector((s: RootState) => s.threads);
  const messages = useSelector((s: RootState) => s.messages.items);
  const isChatSidebarOpen = useSelector(selectIsChatSidebarOpen);

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

  // Search functionality from home page
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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

  // Filter threads based on search term and first message processing
  const filteredThreads = useMemo(() => {
    // Only show threads that have processed their first message
    const visibleThreads = threads.filter((thread) => thread.isFirstQueryProcessed === true);

    if (!searchTerm) return visibleThreads;

    const searchLower = searchTerm.toLowerCase();
    return visibleThreads.filter((thread) => {
      // Search in thread name (case-insensitive)
      const nameMatch = thread.name.toLowerCase().includes(searchLower);

      // Also search in original first message if available
      const originalMessageMatch = thread.originalFirstMessage
        ? thread.originalFirstMessage.toLowerCase().includes(searchLower)
        : false;

      return nameMatch || originalMessageMatch;
    });
  }, [threads, searchTerm]);

  // Handle new chat creation
  const handleNewChatClick = () => {
    dispatch(clearFiles());
    const newThreadId = uuidv4();
    dispatch(addThread({ id: newThreadId, name: "New Chat", activate: true }));
    // Clear any patient selection for the new thread
    dispatch(clearThreadPatient(newThreadId));
  };

  // Handle thread selection
  const handleSelectChat = (threadId: string) => {
    dispatch(clearFiles());
    dispatch(setActiveThreadId(threadId));
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-slate-900">
      {/* Persistent Left Sidebar (from home page) */}
      <aside
        className={cn(
          "bg-slate-50 border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col h-full",
          isChatSidebarOpen ? "w-64" : "w-14",
        )}
      >
        <div className="p-2 flex justify-end">
          <Button
            onClick={() => dispatch(setIsChatSidebarOpen(!isChatSidebarOpen))}
            variant="ghost"
            size="icon"
            className="w-9 h-9 hover:bg-slate-200"
          >
            <PanelLeft className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        <div className={cn("flex-1 overflow-y-auto", !isChatSidebarOpen && "hidden")}>
          <div className="px-3 pb-4 space-y-4">
            <div className="space-y-2">
              <Button
                onClick={handleNewChatClick}
                variant="ghost"
                className="w-full justify-start gap-2.5 h-10 px-2 bg-slate-100 text-brand-blue hover:bg-slate-200"
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">New Chat</span>
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search chats and messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 h-10 bg-white"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="px-2 py-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recents
                </span>
              </div>
              <div className="space-y-1">
                {searchTerm && filteredThreads.length === 0 ? (
                  <div className="px-2 py-4 text-center">
                    <p className="text-xs text-gray-500">No chats found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  filteredThreads.map((thread) => {
                    // Check if the thread name should show a tooltip (longer than ~30 characters for sidebar)
                    const shouldShowTooltip = thread.name && thread.name.length > 30;

                    // Create tooltip content that shows both the full title and original message if available
                    const tooltipContent = shouldShowTooltip ? (
                      <div className="max-w-xs">
                        <div className="font-medium">{thread.name}</div>
                        {thread.originalFirstMessage &&
                          thread.originalFirstMessage !== thread.name && (
                            <div className="text-xs opacity-75 mt-1">
                              Original:{" "}
                              {thread.originalFirstMessage.length > 100
                                ? thread.originalFirstMessage.substring(0, 100) + "..."
                                : thread.originalFirstMessage}
                            </div>
                          )}
                      </div>
                    ) : (
                      thread.name
                    );

                    return (
                      <Tooltip
                        key={thread.id}
                        content={tooltipContent}
                        disabled={!shouldShowTooltip}
                        side="right"
                        align="start"
                      >
                        <Button
                          variant="ghost"
                          onClick={() => handleSelectChat(thread.id)}
                          className={cn(
                            "w-full justify-start h-9 px-2 text-gray-600 hover:bg-slate-100 text-sm",
                            activeThreadId === thread.id &&
                              "bg-slate-200 text-gray-800 font-semibold",
                          )}
                        >
                          <span className="truncate">{thread.name}</span>
                        </Button>
                      </Tooltip>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
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
