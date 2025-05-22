"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { Thread } from "@/components/assistant_ui/thread";
import { ThreadList } from "@/components/assistant_ui/thread_list";
import { ChatTopbar } from "./ChatTopbar";
import { TeraRuntimeProvider } from "./TeraRuntimeProvider";

import type { AppDispatch, RootState } from "@/lib/store";
import { loadMessages } from "@/lib/store/messagesSlice";
import { addThread, loadThreads } from "@/lib/store/threadsSlice";
import { patientDatabase } from "@/mock/chat.data";
import { ThreadListDrawer } from "./ThreadListDrawer";

export default function ChatClient() {
  const dispatch = useDispatch<AppDispatch>();

  const [currentPatientId, setCurrentPatientId] = useState<keyof typeof patientDatabase>("PT-1004");
  const [isPatientContextEnabled, setIsPatientContextEnabled] = useState(true);
  const [forceFresh, setForceFresh] = useState(false);
  const [cacheDebug, setCacheDebug] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { threads, activeThreadId } = useSelector((s: RootState) => s.threads);
  const messages = useSelector((s: RootState) => s.messages.items);

  const hasLoaded = useRef(false);

  /* load once */
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    try {
      const storedThreads = localStorage.getItem("chatThreads");
      if (storedThreads) dispatch(loadThreads(JSON.parse(storedThreads)));

      const storedMsgs = localStorage.getItem("chatMessages");
      if (storedMsgs) dispatch(loadMessages(JSON.parse(storedMsgs)));
    } catch (e) {
      console.warn("Corrupt chat persistence, clearing.", e);
      localStorage.removeItem("chatThreads");
      localStorage.removeItem("chatMessages");
    }
  }, [dispatch]);

  /* persist on change (debounced to animation-frame for perf) */
  useEffect(() => {
    if (threads.length)
      requestAnimationFrame(() => localStorage.setItem("chatThreads", JSON.stringify(threads)));
  }, [threads]);

  useEffect(() => {
    if (messages.length)
      requestAnimationFrame(() => localStorage.setItem("chatMessages", JSON.stringify(messages)));
  }, [messages]);

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

  return (
    <div className="flex h-full  w-full flex-col bg-white dark:bg-slate-900">
      <ChatTopbar
        onOpenDrawer={() => setDrawerOpen(true)} /* NEW */
        currentPatientId={currentPatientId}
        setCurrentPatientId={setCurrentPatientId}
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
          currentPatientId={currentPatientId}
          isPatientContextEnabled={isPatientContextEnabled}
          forceFresh={forceFresh}
          cacheDebug={cacheDebug}
        >
          {/* drawer for ANY screen size */}
          <ThreadListDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

          {/* messages */}
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
  );
}
