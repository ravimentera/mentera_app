"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import {
  Edit,
  PanelLeft,
  Search,
  SendHorizontalIcon,
  PaperclipIcon,
  ArrowDownIcon,
  CheckIcon,
  CopyIcon,
  FileIcon,
} from "lucide-react";

import {
  AssistantRuntimeProvider as AUIProvider,
  ThreadPrimitive,
  ActionBarPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
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
import { Message as ReduxMessage } from "@/lib/store/slices/messagesSlice";
import { UploadedFile, clear as clearFiles, removeFile, selectAllFiles } from "@/lib/store/slices/fileUploadsSlice";
import { useGetPatientsByProviderQuery } from "@/lib/store/api";
import { TooltipIconButton } from "@/components/molecules/TooltipIconButton";
import { useFileUpload } from "@/lib//hooks/useFileUpload";
import { TeraRuntimeProvider } from "@/components/organisms/chat/TeraRuntimeProvider";

const ChatTopbar = ({
  onOpenDrawer,
  currentPatientId,
  setCurrentPatientId,
}) => {
  const { data: apiPatients } = useGetPatientsByProviderQuery("NR-2001");
  const patientsData = apiPatients || [];
  
  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white h-16 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Talk to Tera</h2>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="font-medium">Patient:</span>
          <select
            className="ml-2 border rounded px-2 py-1 bg-white text-black relative z-50"
            value={currentPatientId}
            onChange={(e) => setCurrentPatientId(e.target.value)}
          >
            {patientsData.map((patient) => {
              console.log({patient});
              
              return <option key={patient.id} value={patient.patientId}>
                {patient.firstName} {patient.lastName}
              </option>
})}
          </select>
        </label>
      </div>
    </div>
  );
};

// NEW: Welcome component to be displayed inside an empty chat thread.
const ChatWelcome: React.FC = () => {
    return (
        <ThreadPrimitive.Empty>
            <div className="w-full h-full flex flex-col items-center justify-center px-4 -mt-24">
                <div className="max-w-2xl w-full text-center">
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
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <ThreadPrimitive.Suggestion
                            prompt="Today's Appointments"
                            method="send"
                            className="bg-gray-100/80 hover:bg-gray-200 text-gray-700 text-sm font-medium h-9 px-3 rounded-md"
                        >
                            Today's Appointments
                        </ThreadPrimitive.Suggestion>
                        <ThreadPrimitive.Suggestion
                            prompt="Pre/Post Instructions"
                            method="send"
                             className="bg-gray-100/80 hover:bg-gray-200 text-gray-700 text-sm font-medium h-9 px-3 rounded-md"
                        >
                            Pre/Post Instructions
                        </ThreadPrimitive.Suggestion>
                    </div>
                </div>
            </div>
        </ThreadPrimitive.Empty>
    );
};

const ChatThread: React.FC<{ isRunning?: boolean }> = ({ isRunning }) => {
  return (
    <ThreadPrimitive.Root className="bg-background box-border flex h-full flex-col overflow-hidden">
      <ThreadPrimitive.Viewport className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8">
        <ChatWelcome />
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
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

const FilePreview = () => {
    const dispatch = useDispatch();
    const files = useSelector(selectAllFiles);

    if (files.length === 0) return null;

    return (
        <div className="border-t p-2">
            <div className="flex w-full gap-2 overflow-x-auto px-2 py-1">
                {files.map((f: UploadedFile) => (
                    <div key={f.id} className="relative h-16 w-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center overflow-visible border">
                        <button
                            onClick={() => dispatch(removeFile(f.id))}
                            className="absolute -top-1.5 -right-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-[10px] font-bold leading-none text-white shadow hover:bg-red-500 transition-colors"
                            aria-label={`Remove ${f.name}`}
                            type="button"
                        >
                            ×
                        </button>
                        {f.type.startsWith("image/") ? (
                            <Image src={f.previewUrl} alt={f.name} layout="fill" className="object-cover rounded-md" />
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-center p-1">
                                <FileIcon className="h-6 w-6 text-gray-500" />
                                <span className="text-xs text-gray-500 truncate w-14">{f.name}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

const Composer: React.FC<{ isRunning?: boolean }> = ({ isRunning }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useFileUpload();
  const files = useSelector(selectAllFiles);

  const triggerBrowse = () => fileInputRef.current?.click();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!e.target.files) return;

    const incoming = Array.from(e.target.files);
    if (incoming.length + files.length > 5) {
      alert("You can attach a maximum of 5 files per message.");
      e.target.value = "";
      return;
    }

    for (const file of incoming) {
      try {
        await uploadFile(file);
      } catch (err) {
        console.error("File upload failed:", err);
      }
    }
    e.target.value = "";
  };

  return (
    <ComposerPrimitive.Root className="focus-within:border-purple-500/50 flex w-full flex-col rounded-lg border bg-white shadow-sm transition-colors">
      <FilePreview />
      <div className="flex w-full items-end px-2.5">
        <Button variant="ghost" size="icon" className="my-2.5" onClick={triggerBrowse} type="button">
          <PaperclipIcon className="h-5 w-5" />
        </Button>
        <input ref={fileInputRef} type="file" hidden onChange={handleChange} multiple />
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
};


const UserMessage: React.FC = () => (
  <MessagePrimitive.Root className="grid auto-rows-auto grid-cols-[1fr_auto] gap-y-2 w-full max-w-2xl py-4">
    <div className="bg-muted text-foreground max-w-full break-words rounded-xl px-4 py-2.5 col-start-2 row-start-1">
      <MessagePrimitive.Content />
    </div>
  </MessagePrimitive.Root>
);

const AssistantMessage: React.FC = () => (
  <MessagePrimitive.Root className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] relative w-full max-w-2xl py-4 gap-x-3 items-start">
    <Image
      src="/assets/icons/chat.png"
      width={32}
      height={32}
      alt="Tera"
      className="rounded-full row-span-2"
    />
    <div className="text-foreground max-w-full break-words leading-7 col-start-2 row-start-1 my-1.5">
      <MessagePrimitive.Content components={{ Text: MarkdownText }} />
    </div>
    <AssistantActionBar />
  </MessagePrimitive.Root>
);

const AssistantActionBar: React.FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="text-muted-foreground flex gap-1 col-start-2 row-start-2 -ml-1 data-[floating]:bg-background data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
    </ActionBarPrimitive.Root>
  );
};

const ActiveChatPane = () => {
  return (
    <div className="h-full">
      <ChatThread />
    </div>
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
  const [isPatientContextEnabled, setIsPatientContextEnabled] = useState(true);
  const [forceFresh, setForceFresh] = useState(false);
  const [cacheDebug, setCacheDebug] = useState(false);

  // This effect ensures a thread is always active, allowing the WebSocket to connect on load.
  useEffect(() => {
    if (!activeThreadId) {
      const newThreadId = uuidv4();
      dispatch(addThread({ id: newThreadId, name: "New Chat", activate: true }));
    }
  }, [activeThreadId, dispatch]);
  
  const handleNewChatClick = () => {
      dispatch(clearFiles());
      const newThreadId = uuidv4();
      dispatch(addThread({ id: newThreadId, name: "New Chat", activate: true }));
  }
  const handleSelectChat = (threadId: string) => {
      dispatch(clearFiles());
      dispatch(setActiveThreadId(threadId));
  }

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
        />
        <div className="flex-1 min-h-0">
          {activeThreadId ? (
            <TeraRuntimeProvider
                activeThreadId={activeThreadId}
                currentPatientId={currentPatientId}
                isPatientContextEnabled={isPatientContextEnabled}
                forceFresh={forceFresh}
                cacheDebug={cacheDebug}
            >
                <ActiveChatPane />
            </TeraRuntimeProvider>
          ) : (
             <div className="flex h-full items-center justify-center">
                <p>Loading chat...</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
