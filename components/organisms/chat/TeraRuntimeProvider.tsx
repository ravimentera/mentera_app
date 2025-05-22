"use client";

import { store } from "@/lib/store";
import type { AppDispatch, RootState } from "@/lib/store";
import {
  AssistantRuntimeProvider as AUIProvider,
  AppendMessage,
  AssistantRuntime,
  ThreadListRuntime,
  ThreadMessageLike,
  ThreadRuntime,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import React, { PropsWithChildren, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import {
  Message as ReduxMessage,
  addMessage,
  deleteMessagesForThread,
} from "@/lib/store/messagesSlice";

import { addThread, deleteThread, setActiveThreadId } from "@/lib/store/threadsSlice";

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
    getItemByIndex(i: number) {
      return getOrCreateItem(this.getState().threads[i]) as any;
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
      dispatch(addThread({ id, activate: true }));
      getOrCreateItem(id).__emit?.("switched-to");
    },
  };
}

export interface TeraRuntimeProviderProps extends PropsWithChildren {
  activeThreadId: string;
  currentPatientId: string;
  isPatientContextEnabled: boolean;
  forceFresh: boolean;
  cacheDebug: boolean;
}

export function TeraRuntimeProvider({
  children,
  activeThreadId,
  currentPatientId,
  isPatientContextEnabled,
  forceFresh,
  cacheDebug,
}: TeraRuntimeProviderProps) {
  const dispatch = useDispatch<AppDispatch>();

  /*  messages for active thread */
  const messages = useSelector((s: RootState) =>
    s.messages.items.filter((m) => m.threadId === activeThreadId),
  );

  /*  websocket */
  const { loading, sendMessage } = useWebSocketChat({
    currentPatientId,
    isPatientContextEnabled,
    forceFresh,
    cacheDebug,
    activeThreadId,
  });

  /*  on new user message */
  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
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
      console.log({ reduxMsg });

      dispatch(addMessage(reduxMsg));
      sendMessage(text);
    },
    [activeThreadId],
  );

  /*  per-thread runtime */
  const messageRuntime = useExternalStoreRuntime<ReduxMessage>({
    messages,
    isRunning: loading,
    onNew,
    convertMessage: toAUIMessage,
  });

  /* thread-list runtime */
  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  const threadListRuntime = useMemo(
    () => createReduxThreadListRuntime(messageRuntime.thread, dispatch, store.getState),
    [messageRuntime.thread],
  );

  /*  wire the Redux actions into the external-store core **once** */
  const coreThreads = (messageRuntime as any)._core.threads; // ⚠️ cast

  coreThreads.adapter.onSwitchToNewThread = () => threadListRuntime.switchToNewThread();

  coreThreads.adapter.onSwitchToThread = (id: string) => threadListRuntime.switchToThread(id);

  /* optional: keep the adapter’s current threadId & list in sync */
  coreThreads.adapter.threadId = activeThreadId;
  coreThreads.adapter.threads = threadListRuntime
    .getState()
    .threads.map((id) => threadListRuntime.getItemById(id));

  //  6½  keep threads-core wired no matter how often the adapter object changes
  const threadsCore: any = (messageRuntime as any)._core.threads;

  // helper ↻
  const patchAdapter = () => {
    threadsCore.adapter.onSwitchToNewThread = () => threadListRuntime.switchToNewThread();
    threadsCore.adapter.onSwitchToThread = (id: string) => threadListRuntime.switchToThread(id);
  };

  // run once now …
  patchAdapter();

  // …and every time the library swaps its adapter object
  const originalSet = threadsCore.__internal_setAdapter.bind(threadsCore);
  threadsCore.__internal_setAdapter = (nextAdapter: any) => {
    originalSet(nextAdapter); // keep normal behaviour
    patchAdapter(); // re-attach our callbacks
  };

  /* 7️⃣ expose archive + custom threads object (you already had this) */
  (messageRuntime as any).threads = threadListRuntime;
  (messageRuntime as any).archive = async (id: string) => {
    dispatch(deleteMessagesForThread(id));
    dispatch(deleteThread(id));
  };

  return <AUIProvider runtime={messageRuntime}>{children}</AUIProvider>;
}
