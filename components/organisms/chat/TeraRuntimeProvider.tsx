"use client";

import { store } from "@/lib/store";
import type { AppDispatch, RootState } from "@/lib/store";
import { clear, selectAllFiles } from "@/lib/store/slices/fileUploadsSlice";
import {
  Message as ReduxMessage,
  addMessage,
  deleteMessagesForThread,
} from "@/lib/store/slices/messagesSlice";
import { addThread, deleteThread, setActiveThreadId } from "@/lib/store/slices/threadsSlice";
import {
  AssistantRuntimeProvider as AUIProvider,
  AppendMessage,
  FeedbackAdapter,
  ThreadListRuntime,
  ThreadMessageLike,
  ThreadRuntime,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import React, { PropsWithChildren, useCallback, useMemo } from "react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { useWebSocketChat } from "./useWebSocketChat";

const toAUIMessage = (msg: ReduxMessage): ThreadMessageLike => ({
  id: msg.id,
  role: msg.sender === "user" ? "user" : "assistant", // keep if you might have legacy "ai"
  // or simply:
  // role: msg.sender as "user" | "assistant",
  content: [{ type: "text", text: String(msg.text ?? "") }],
  createdAt: new Date(msg.createdAt),
});

function makeItemRuntime(idFn: () => string | undefined) {
  const listeners: Record<string, Set<() => void>> = {};
  const on = (evt: string, cb: () => void) => {
    if (!listeners[evt]) listeners[evt] = new Set();

    // biome-ignore lint/style/noNonNullAssertion: reason for ignoring
    listeners[evt]!.add(cb);
    return () => listeners[evt]?.delete(cb);
  };
  const emit = (evt: string) => listeners[evt]?.forEach((cb) => cb());

  /*  runtime object  */
  return {
    /* mandatory state getter — NEVER returns undefined */
    getState() {
      const { threads, activeThreadId } = store.getState().threads;
      const id = idFn() ?? ""; // fallback for safety
      const thread = threads.find((t) => t.id === id);
      return {
        id,
        threadId: id,
        remoteId: thread?.remoteId,
        externalId: thread?.externalId,
        title: thread?.name ?? "Untitled",
        status: "regular" as const,
        isMain: id === activeThreadId,
      };
    },

    /* subscribe never breaks */
    subscribe(cb: () => void) {
      return store.subscribe(cb);
    },

    /* event bus used by ComposerInput focus logic */
    unstable_on: on,
    __emit: emit, // exposed so ThreadListRuntime can fire events

    /* optional no-ops to satisfy the interface */
    async archive() {},
    async unarchive() {},
    async delete() {},
    /* NEW ---------- imperative helpers expected by <ThreadListItemTrigger /> */
    async switchTo() {
      // biome-ignore lint/style/noNonNullAssertion: reason for ignoring
      store.dispatch(setActiveThreadId(idFn()!));
      this.__emit?.("switched-to");
    },
    async rename(newTitle: string) {
      // Thread-list runtime backed by Redux
    },
  };
}

// Thread-list runtime backed by Redux
function createReduxThreadListRuntime(
  mainRuntime: ThreadRuntime,
  dispatch: AppDispatch,
  getRoot: () => RootState,
): ThreadListRuntime {
  const slice = () => getRoot().threads;

  /* ⚡ 1. stable cache — one runtime object per threadId */
  const itemCache = new Map<string, ReturnType<typeof makeItemRuntime>>();
  const getOrCreateItem = (id?: string) => {
    if (!id) return makeItemRuntime(() => undefined);
    if (!itemCache.has(id))
      itemCache.set(
        id,
        makeItemRuntime(() => id),
      );
    // biome-ignore lint/style/noNonNullAssertion: reason for ignoring
    return itemCache.get(id)!; // always same ref
  };

  return {
    // state
    getState() {
      const s = slice();
      return {
        mainThreadId: s.activeThreadId ?? "",
        newThread: undefined,
        threads: s.threads.map((t) => t.id),
        archivedThreads: [],
      };
    },
    subscribe(cb) {
      return store.subscribe(cb);
    },

    // getters
    get main() {
      return mainRuntime;
    },
    get mainItem() {
      return getOrCreateItem(this.getState().mainThreadId) as any;
    },

    // look-ups
    getById(id) {
      this.switchToThread(id);
      return this.main;
    },
    getItemById: (id) => getOrCreateItem(id) as any,
    getItemByIndex: (i: number) => {
      const threads = slice().threads;
      return getOrCreateItem(i < 0 || i >= threads.length ? undefined : threads[i]?.id) as any;
    },
    getArchivedItemByIndex(i: number) {
      return getOrCreateItem(this.getState().archivedThreads[i]) as any;
    },

    // actions
    async switchToThread(id) {
      dispatch(setActiveThreadId(id));
      getOrCreateItem(id).__emit?.("switched-to"); // focus event
    },
    async switchToNewThread() {
      const id = uuidv4();
      dispatch(addThread({ id, name: "New Chat", activate: true }));
      getOrCreateItem(id).__emit?.("switched-to");
    },
  };
}

export interface TeraRuntimeProviderProps extends PropsWithChildren {
  activeThreadId: string;
  isPatientContextEnabled: boolean;
  forceFresh: boolean;
  cacheDebug: boolean;
}

export function TeraRuntimeProvider({
  children,
  activeThreadId,
  isPatientContextEnabled,
  forceFresh,
  cacheDebug,
}: TeraRuntimeProviderProps) {
  const dispatch = useDispatch<AppDispatch>();

  /*  messages for active thread */
  const messages = useSelector((s: RootState) =>
    s.messages.items.filter((m) => m.threadId === activeThreadId),
  );
  const allFiles = useSelector(selectAllFiles);

  //  keep latest files in a ref so onNew always sees the current list
  const filesRef = useRef(allFiles);
  useEffect(() => {
    filesRef.current = allFiles;
  }, [allFiles]);

  /*  websocket */
  const { loading, sendMessage, isAuthenticated } = useWebSocketChat({
    isPatientContextEnabled,
    forceFresh,
    cacheDebug,
    activeThreadId,
  });

  // This ref now tracks sent messages on a per-thread basis.
  const sentMessagesByThreadRef = useRef(new Map<string, Set<string>>());

  // This effect is the key. It watches for new user messages in Redux
  // and sends them if they haven't been sent yet and the socket is authenticated.
  useEffect(() => {
    if (!isAuthenticated || !activeThreadId) return;

    // Get or create the set of sent message IDs for the current thread.
    const sentIdsForThisThread =
      sentMessagesByThreadRef.current.get(activeThreadId) ?? new Set<string>();

    const unsentMessages = messages.filter(
      (m) => m.sender === "user" && !sentIdsForThisThread.has(m.id),
    );

    if (unsentMessages.length > 0) {
      for (const msg of unsentMessages) {
        console.log(
          `TeraRuntimeProvider: Sending message ID ${msg.id} for thread ${activeThreadId}`,
        );
        sendMessage(msg.text, filesRef.current);
        sentIdsForThisThread.add(msg.id); // Mark this message as sent for this thread
      }
      // Update the map with the new set of sent IDs for this thread.
      sentMessagesByThreadRef.current.set(activeThreadId, sentIdsForThisThread);

      if (filesRef.current.length > 0) dispatch(clear());
    }
  }, [messages, isAuthenticated, sendMessage, dispatch, activeThreadId]);

  // onNew is now only for messages coming from the Composer UI
  const onNew = useCallback(
    async (msg: AppendMessage): Promise<void> => {
      const text = msg.content[0]?.type === "text" ? msg.content[0].text : "";

      const reduxMsg: ReduxMessage = {
        id: uuidv4(),
        threadId: activeThreadId,
        sender: "user",
        text,
        createdAt: Date.now(),
      };
      dispatch(addMessage(reduxMsg));
      // The useEffect above will detect this new message and send it.
    },
    [activeThreadId, dispatch],
  );

  const onReload: Parameters<typeof useExternalStoreRuntime<ReduxMessage>>[0]["onReload"] =
    useCallback(
      async (parentId: any) => {
        if (!parentId) return;

        /* Snapshot the current thread messages BEFORE we mutate state */
        const threadMsgs = store
          .getState()
          .messages.items.filter((m) => m.threadId === activeThreadId);

        console.log({ threadMsgs, parentId });

        const lastUserMsg = threadMsgs.find((m) => m.id === parentId && m.sender === "user");

        if (!lastUserMsg) return; // nothing to retry with

        console.log({ lastUserMsg });

        /* Insert a brand-new copy of the user prompt so the UI shows it again */
        const clonedUser: ReduxMessage = {
          ...lastUserMsg,
          id: uuidv4(), // give it a new ID
          createdAt: Date.now(),
        };
        dispatch(addMessage(clonedUser));

        /* Fire the prompt off to your backend */
        sendMessage(lastUserMsg.text, undefined); // no files on retry
      },
      [activeThreadId, dispatch, sendMessage],
    );

  const feedbackAdapter: FeedbackAdapter = {
    async submit({ message, type }) {
      // this now prints the real ID
      console.log(`${type} feedback for message: ${message.id}`);

      // send to backend, analytics, etc.
      // await fetch("/api/feedback", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     messageId: message.id,
      //     rating: type,           // "positive" | "negative"
      //   }),
      // });
    },
  };

  const messageRuntime = useExternalStoreRuntime<ReduxMessage>({
    messages,
    isRunning: loading,
    onNew,
    convertMessage: toAUIMessage,
    onReload,
    adapters: {
      feedback: feedbackAdapter,
    },
  });

  const threadListRuntime = useMemo(
    () => createReduxThreadListRuntime(messageRuntime.thread, dispatch, () => store.getState()),
    [messageRuntime.thread, dispatch],
  );

  const coreThreads = (messageRuntime as any)._core.threads;

  const patchAdapter = useCallback(() => {
    coreThreads.adapter.onSwitchToNewThread = () => threadListRuntime.switchToNewThread();
    coreThreads.adapter.onSwitchToThread = (id: string) => threadListRuntime.switchToThread(id);
    coreThreads.adapter.threadId = activeThreadId;
    coreThreads.adapter.threads = threadListRuntime
      .getState()
      .threads.map((id) => threadListRuntime.getItemById(id));
  }, [coreThreads, threadListRuntime, activeThreadId]);

  useEffect(() => {
    patchAdapter();
  }, [patchAdapter]);

  (messageRuntime as any).threads = threadListRuntime;
  (messageRuntime as any).archive = async (id: string) => {
    dispatch(deleteMessagesForThread(id));
    dispatch(deleteThread(id));
  };

  return <AUIProvider runtime={messageRuntime}>{children}</AUIProvider>;
}
