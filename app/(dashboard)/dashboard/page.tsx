// components/organisms/chat/ChatClient.tsx
"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  Edit,
  PanelLeft,
  Search,
  SendHorizontalIcon,
  PaperclipIcon,
  ArrowDownIcon,
} from "lucide-react";

import {
  AssistantRuntimeProvider as AUIProvider,
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useExternalStoreRuntime,
  AppendMessage,
} from "@assistant-ui/react";
import { useWebSocketChat } from "@/components/organisms/chat/useWebSocketChat";
import { Button } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { MarkdownText } from "@/components/molecules/MarkdownText";

import type { AppDispatch, RootState } from "@/lib/store";
import { addThread, setActiveThread, setActiveThreadId } from "@/lib/store/slices/threadsSlice";
import {
  selectPatientDatabase,
  selectSelectedPatientId,
  setSelectedPatientId,
} from "@/lib/store/slices/globalStateSlice";
import { Message as ReduxMessage, addMessage } from "@/lib/store/slices/messagesSlice";
import { clear as clearFiles, selectAllFiles } from "@/lib/store/slices/fileUploadsSlice";

const toAUIMessage = (msg: ReduxMessage) => ({
  id: msg.id,
  role: msg.sender === "user" ? "user" : "assistant",
  content: [{ type: "text", text: String(msg.text ?? "") }],
  createdAt: new Date(msg.createdAt),
});

// A new ChatTopbar component created from the props of the old one
const ChatTopbar = ({
  onOpenDrawer,
  currentPatientId,
  setCurrentPatientId,
  isPatientContextEnabled,
  setIsPatientContextEnabled,
  forceFresh,
  setForceFresh,
  cacheDebug,
  setCacheDebug,
  patientDB,
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white h-16 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Talk to Tera</h2>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="font-medium">Patient:</span>
          <select
            className="ml-2 border rounded px-2 py-1 bg-white text-black"
            value={currentPatientId}
            onChange={(e) => setCurrentPatientId(e.target.value)}
          >
            {Object.keys(patientDB).map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={isPatientContextEnabled}
            onChange={(e) => setIsPatientContextEnabled(e.target.checked)}
          />
          <span>Context</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={forceFresh}
            onChange={(e) => setForceFresh(e.target.checked)}
          />
          <span>No Cache</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={cacheDebug}
            onChange={(e) => setCacheDebug(e.target.checked)}
          />
          <span>Cache Debug</span>
        </label>
      </div>
    </div>
  );
};

// The main chat UI. It receives the isRunning status from the parent.
const ChatThread = ({ isRunning }) => {
  return (
    <ThreadPrimitive.Root className="bg-background box-border flex h-full flex-col overflow-hidden">
      <ThreadPrimitive.Viewport className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8">
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />
        <div className="min-h-8 flex-grow" />
        <div className="sticky bottom-0 mt-3 flex w-full max-w-2xl flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
          <ThreadScrollToBottom />
          <Composer isRunning={isRunning} />
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: React.FC = () => (
  <ThreadPrimitive.ScrollToBottom asChild>
    <Button
      variant="outline"
      size="icon"
      className="absolute -top-10 rounded-full disabled:invisible bg-white shadow"
    >
      <ArrowDownIcon className="h-4 w-4" />
    </Button>
  </ThreadPrimitive.ScrollToBottom>
);

// The composer now also receives the isRunning prop to disable the send button.
const Composer: React.FC<{ isRunning: boolean }> = ({ isRunning }) => (
  <ComposerPrimitive.Root className="focus-within:border-purple-500/50 flex w-full flex-col rounded-lg border bg-white shadow-sm transition-colors">
    <div className="flex w-full items-end px-2.5">
      <Button variant="ghost" size="icon" className="my-2.5">
        <PaperclipIcon className="h-5 w-5" />
      </Button>
      <ComposerPrimitive.Input
        rows={1}
        placeholder="Ask anything..."
        className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0"
        disabled={isRunning}
      />
      <ComposerPrimitive.Send asChild>
        <Button variant="ghost" size="icon" className="my-2.5 text-purple-600" disabled={isRunning}>
          <SendHorizontalIcon className="h-5 w-5" />
        </Button>
      </ComposerPrimitive.Send>
    </div>
  </ComposerPrimitive.Root>
);

const UserMessage: React.FC = () => (
  <MessagePrimitive.Root className="grid auto-rows-auto grid-cols-[1fr_auto] gap-y-2 w-full max-w-2xl py-4">
    <div className="bg-muted text-foreground max-w-full break-words rounded-xl px-4 py-2.5 col-start-2 row-start-1">
      <MessagePrimitive.Content />
    </div>
  </MessagePrimitive.Root>
);

const AssistantMessage: React.FC = () => (
  <MessagePrimitive.Root className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] relative w-full max-w-2xl py-4 gap-x-3">
    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs row-span-2 shrink-0">
      R
    </div>
    <div className="text-foreground max-w-full break-words leading-7 col-start-2 row-start-1 my-1.5">
      <MessagePrimitive.Content components={{ Text: MarkdownText }} />
    </div>
  </MessagePrimitive.Root>
);

const NewChatForm = ({ onStartChat }) => {
  const [input, setInput] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onStartChat(input.trim());
      setInput("");
    }
  };
  return (
    <div className="w-full mt-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624l-.218-2.182a3.375 3.375 0 00-2.456-2.456L12.75 15.75l2.182-.218a3.375 3.375 0 002.456-2.456l.218-2.182.218 2.182a3.375 3.375 0 002.456 2.456l2.182.218-2.182.218a3.375 3.375 0 00-2.456 2.456l-.218 2.182z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything"
          className="w-full border-2 border-gray-300 bg-white rounded-xl py-4 pl-12 pr-14 text-base focus:ring-purple-500 focus:border-purple-600 outline-none transition-colors"
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800"
          aria-label="Send message"
        >
          <SendHorizontalIcon className="h-5 w-5" />
        </button>
      </form>
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="ghost"
          className="bg-gray-100/80 hover:bg-gray-200 text-gray-700 text-sm font-medium h-9 px-3"
        >
          Today's Appointments
        </Button>
        <Button
          variant="ghost"
          className="bg-gray-100/80 hover:bg-gray-200 text-gray-700 text-sm font-medium h-9 px-3"
        >
          Pre/Post Instructions
        </Button>
      </div>
    </div>
  );
};

const WelcomeView = ({ onStartChat }) => (
  <div className="w-full h-full flex flex-col items-center justify-center px-4 bg-gray-50/40">
    <div className="max-w-xl w-full text-center">
      <h1 className="text-5xl font-bold text-purple-600 mb-6">Hello, Rachel</h1>
      <div className="bg-white p-6 rounded-xl border border-gray-200 text-left space-y-2 shadow-sm mb-6">
        <p className="font-semibold text-gray-800">TODAY</p>
        <p className="text-gray-600">8 appointments — first at 9:00 AM, last at 4:30 PM</p>
        <p className="font-semibold text-gray-800 mt-4">REMINDERS</p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>3 charts pending</li>
          <li>Pre-care needed (filler)</li>
          <li>Laser follow-up – Jenna R.</li>
        </ul>
      </div>
      <NewChatForm onStartChat={onStartChat} />
    </div>
  </div>
);

const ActiveChatPane = ({
  activeThreadId,
  currentPatientId,
  isPatientContextEnabled,
  forceFresh,
  cacheDebug,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { connected, loading, sendMessage } = useWebSocketChat({
    activeThreadId,
    currentPatientId,
    isPatientContextEnabled,
    forceFresh,
    cacheDebug,
  });

  const messages = useSelector((s: RootState) =>
    s.messages.items.filter((m) => m.threadId === activeThreadId),
  );
  const allFiles = useSelector(selectAllFiles);
  const filesRef = useRef(allFiles);
  useEffect(() => {
    filesRef.current = allFiles;
  }, [allFiles]);

  const initialMessageSentRef = useRef(false);

  useEffect(() => {
    if (connected && !initialMessageSentRef.current) {
      const threadMessages = messages.filter((m) => m.threadId === activeThreadId);
      if (threadMessages.length === 1 && threadMessages[0].sender === "user") {
        sendMessage(threadMessages[0].text);
        initialMessageSentRef.current = true;
      }
    }
  }, [connected, messages, activeThreadId, sendMessage]);

  const onNew = useCallback(
    async (msg: AppendMessage): Promise<void> => {
      const text = msg.content[0]?.type === "text" ? msg.content[0].text : "";
      // The first message is handled by the useEffect above, this handles subsequent messages.
      if (initialMessageSentRef.current) {
        dispatch(
          addMessage({
            id: uuidv4(),
            threadId: activeThreadId,
            sender: "user",
            text,
            createdAt: Date.now(),
          }),
        );
        sendMessage(text, filesRef.current);
        dispatch(clearFiles());
      } else {
        // This handles the very first message if the connection is already live
        const threadMessages = messages.filter((m) => m.threadId === activeThreadId);
        if (threadMessages.length === 1 && threadMessages[0].sender === "user") {
          sendMessage(threadMessages[0].text);
          initialMessageSentRef.current = true;
        }
      }
    },
    [activeThreadId, dispatch, sendMessage, filesRef, messages],
  );

  const messageRuntime = useExternalStoreRuntime<ReduxMessage>({
    messages,
    isRunning: loading,
    onNew,
    convertMessage: toAUIMessage,
  });

  return (
    <AUIProvider runtime={messageRuntime}>
      <div className="h-full">
        <ChatThread isRunning={loading} />
      </div>
    </AUIProvider>
  );
};

export default function ChatClient() {
  const dispatch = useDispatch<AppDispatch>();

  const patientDB = useSelector(selectPatientDatabase);
  const selectedId = useSelector(selectSelectedPatientId);
  const { threads, activeThreadId } = useSelector((s: RootState) => s.threads);
  const defaultPatientId = Object.keys(patientDB)[0] as string;

  useEffect(() => {
    if (!selectedId && defaultPatientId) {
      dispatch(setSelectedPatientId(defaultPatientId));
    }
  }, [selectedId, defaultPatientId, dispatch]);

  const currentPatientId = selectedId ?? defaultPatientId;

  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);

  // States from old ChatTopbar
  const [isPatientContextEnabled, setIsPatientContextEnabled] = useState(true);
  const [forceFresh, setForceFresh] = useState(false);
  const [cacheDebug, setCacheDebug] = useState(false);

  const handleStartChat = (name: string) => {
    const newThreadId = uuidv4();
    const newMsgId = uuidv4();

    dispatch(addThread({ id: newThreadId, name: name, activate: false }));
    dispatch(
      addMessage({
        id: newMsgId,
        threadId: newThreadId,
        sender: "user",
        text: name,
        createdAt: Date.now(),
      }),
    );
    dispatch(setActiveThreadId(newThreadId));
  };

  const handleNewChatClick = () => dispatch(setActiveThread(null));
  const handleSelectChat = (threadId: string) => dispatch(setActiveThread(threadId));

  return (
    <div className="min-h-screen bg-gray-50/40 flex w-full h-full relative">
      <aside
        className={cn(
          "bg-slate-50 border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col h-full",
          isChatSidebarOpen ? "w-64" : "w-14",
        )}
      >
        <div className="p-2 flex justify-end">
          <Button
            onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
            variant="ghost"
            size="icon"
            className="w-9 h-9 hover:bg-slate-200"
          >
            <PanelLeft className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        <div className={cn("flex-1 overflow-y-auto", !isChatSidebarOpen && "hidden")}>
          <div className="px-3 pb-4 space-y-4">
            <div className="space-y-1">
              <Button
                onClick={handleNewChatClick}
                variant="ghost"
                className="w-full justify-start gap-2.5 h-10 px-2 bg-slate-100 text-purple-600 hover:bg-slate-200"
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">New Chat</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2.5 h-10 px-2 text-gray-700 hover:bg-slate-100"
              >
                <Search className="h-4 w-4" />
                <span className="text-sm font-medium">Search Chat</span>
              </Button>
            </div>
            <div className="space-y-1">
              <div className="px-2 py-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recents
                </span>
              </div>
              <div className="space-y-1">
                {threads.map((thread) => (
                  <Button
                    key={thread.id}
                    variant="ghost"
                    onClick={() => handleSelectChat(thread.id)}
                    className={cn(
                      "w-full justify-start h-9 px-2 text-gray-600 hover:bg-slate-100 text-sm",
                      activeThreadId === thread.id && "bg-slate-200 text-gray-800 font-semibold",
                    )}
                  >
                    <span className="truncate">{thread.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 bg-white">
        <ChatTopbar
          onOpenDrawer={() => setIsChatSidebarOpen(true)}
          currentPatientId={currentPatientId}
          setCurrentPatientId={(id) => dispatch(setSelectedPatientId(id))}
          isPatientContextEnabled={isPatientContextEnabled}
          setIsPatientContextEnabled={setIsPatientContextEnabled}
          forceFresh={forceFresh}
          setForceFresh={setForceFresh}
          cacheDebug={cacheDebug}
          setCacheDebug={setCacheDebug}
          patientDB={patientDB}
        />
        <div className="flex-1 min-h-0">
          {activeThreadId ? (
            <ActiveChatPane
              key={activeThreadId}
              activeThreadId={activeThreadId}
              currentPatientId={currentPatientId}
              isPatientContextEnabled={isPatientContextEnabled}
              forceFresh={forceFresh}
              cacheDebug={cacheDebug}
            />
          ) : (
            <WelcomeView onStartChat={handleStartChat} />
          )}
        </div>
      </main>

      <div className="absolute bottom-6 right-6">
        <Button
          size="icon"
          className="rounded-full w-14 h-14 bg-purple-600 hover:bg-purple-700 shadow-lg"
        >
          <svg
            className="w-7 h-7 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
