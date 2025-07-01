// components/organisms/chat/ChatClient.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { Thread } from "@/components/organisms/Thread";
import { ChatTopbar } from "./ChatTopbar";
import { TeraRuntimeProvider } from "./TeraRuntimeProvider";
import { ThreadListDrawer } from "./ThreadListDrawer";

import type { AppDispatch, RootState } from "@/lib/store";
import { loadMessages } from "@/lib/store/slices/messagesSlice";
import { addThread, loadThreads } from "@/lib/store/slices/threadsSlice";

import {
  selectPatientDatabase,
  selectSelectedPatientId,
  setSelectedPatientId,
} from "@/lib/store/slices/globalStateSlice";

export default function ChatClient() {
  const dispatch = useDispatch<AppDispatch>();

  // grab the mock patient DB and selected ID from Redux
  const patientDB = useSelector(selectPatientDatabase);
  const selectedId = useSelector(selectSelectedPatientId);

  // pick a default if none is set yet
  const defaultPatientId = Object.keys(patientDB)[0] as string;

  // ensure we always have a currentPatientId in Redux
  useEffect(() => {
    if (!selectedId) {
      dispatch(setSelectedPatientId(defaultPatientId));
    }
  }, [selectedId, defaultPatientId, dispatch]);

  const currentPatientId = selectedId ?? defaultPatientId;

  // local UI state
  const [isPatientContextEnabled, setIsPatientContextEnabled] = React.useState(true);
  const [forceFresh, setForceFresh] = useState(false);
  const [cacheDebug, setCacheDebug] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // load persisted threads & messages once
  const hasLoaded = useRef(false);

  console.log({ selectedId, currentPatientId });

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

  // persist threads & messages
  const { threads, activeThreadId } = useSelector((s: RootState) => s.threads);
  const messages = useSelector((s: RootState) => s.messages.items);

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

  // create a default thread if none exist
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
    <div className="flex h-full w-full flex-col bg-white dark:bg-slate-900">
      <ChatTopbar
        onOpenDrawer={() => setDrawerOpen(true)}
        currentPatientId={currentPatientId}
        setCurrentPatientId={(id) => dispatch(setSelectedPatientId(id))}
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
  );
}
