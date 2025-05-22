/* --------------------------------------------------------------------- */
/*  ChatClient – hosts top-bar, ThreadList, Thread & TeraRuntimeProvider  */
/* --------------------------------------------------------------------- */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { Thread } from "@/components/assistant-ui/thread";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { ChatTopbar } from "./ChatTopbar";
import { TeraRuntimeProvider } from "./TeraRuntimeProvider";

import type { AppDispatch, RootState } from "@/lib/store";
import { loadMessages } from "@/lib/store/messagesSlice";
import { addThread, loadThreads } from "@/lib/store/threadsSlice";
import { patientDatabase } from "@/mock/chat.data";

export default function ChatClient() {
  const dispatch = useDispatch<AppDispatch>();

  /* ---------------------------------------------------- */
  /* 1️⃣   UI toggles & patient selector                   */
  /* ---------------------------------------------------- */
  const [currentPatientId, setCurrentPatientId] = useState<keyof typeof patientDatabase>("PT-1004");
  const [isPatientContextEnabled, setIsPatientContextEnabled] = useState(true);
  const [forceFresh, setForceFresh] = useState(false);
  const [cacheDebug, setCacheDebug] = useState(false);

  /* ---------------------------------------------------- */
  /* 2️⃣   Redux state                                    */
  /* ---------------------------------------------------- */
  const { threads, activeThreadId } = useSelector((s: RootState) => s.threads);
  const messages = useSelector((s: RootState) => s.messages.items);

  /* ---------------------------------------------------- */
  /* 3️⃣   One-time localStorage hydrate / persist        */
  /* ---------------------------------------------------- */
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

  /* ---------------------------------------------------- */
  /* 4️⃣   Ensure at least one thread exists AFTER load    */
  /* ---------------------------------------------------- */
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

  /* ---------------------------------------------------- */
  /* 5️⃣   Render                                          */
  /* ---------------------------------------------------- */
  return (
    <div className="flex h-full  w-full flex-col bg-white dark:bg-slate-900">
      <ChatTopbar
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
          <div className="flex flex-1 overflow-hidden">
            {/* side rail */}
            <div className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
              <ThreadList />
            </div>

            {/* messages pane */}
            <div className="flex-1 overflow-hidden">
              <Thread />
            </div>
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
