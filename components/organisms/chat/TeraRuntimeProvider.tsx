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
  /*  lightweight EventEmitter  */
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

      /* always return a full object (library requires all fields) */
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
      /* optional - no-op */
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
    if (!id) return makeItemRuntime(() => undefined); // ghost
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

  const sentMessageIdsRef = useRef(new Set<string>());

  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  useEffect(() => {
    sentMessageIdsRef.current.clear();
  }, [activeThreadId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsentMessages = messages.filter(
      (m) => m.sender === "user" && !sentMessageIdsRef.current.has(m.id),
    );

    if (unsentMessages.length > 0) {
      console.log(
        `TeraRuntimeProvider: Found ${unsentMessages.length} unsent messages. Sending now.`,
      );
      for (const msg of unsentMessages) {
        sendMessage(msg.text, filesRef.current);
        sentMessageIdsRef.current.add(msg.id);
      }
      if (filesRef.current.length > 0) dispatch(clear());
    }
  }, [messages, isAuthenticated, sendMessage, dispatch, allFiles]);

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
    },
    [activeThreadId, dispatch],
  );

  const messageRuntime = useExternalStoreRuntime<ReduxMessage>({
    messages,
    isRunning: loading,
    onNew,
    convertMessage: toAUIMessage,
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
