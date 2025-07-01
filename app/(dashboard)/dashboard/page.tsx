"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import {
  Edit,
  PanelLeft,
  PaperclipIcon,
  Search,
  SendHorizontalIcon,
} from "lucide-react";

import { Button } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { AppDispatch, RootState } from "@/lib/store";
import { addThread, setActiveThreadId } from "@/lib/store/slices/threadsSlice";
import {
  selectPatientDatabase,
  selectSelectedPatientId,
  setSelectedPatientId,
} from "@/lib/store/slices/globalStateSlice";
import { addMessage } from "@/lib/store/slices/messagesSlice";
import { clear as clearFiles, selectAllFiles } from "@/lib/store/slices/fileUploadsSlice";
import { useGetPatientsByProviderQuery } from "@/lib/store/api";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { TeraRuntimeProvider } from "@/components/organisms/chat/TeraRuntimeProvider";
import { Thread } from "@/components/organisms/Thread";

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
            {patientsData.map((patient) => (
              <option key={patient.id} value={patient.patientId}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

const ActiveChatPane = () => {
  return (
    <div className="h-full">
      <Thread />
    </div>
  );
};

const WelcomeView = ({ onStartChat }) => {
    const [input, setInput] = useState("");
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadFile } = useFileUpload();
    const files = useSelector(selectAllFiles);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [input]);

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
        try { await uploadFile(file); } catch (err) { console.error("File upload failed:", err); }
      }
      e.target.value = "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() || files.length > 0) {
            onStartChat(input.trim());
            setInput("");
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center px-4 bg-gray-50/40">
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
                <div className="w-full mt-8 flex flex-col items-center">
                    <div className="w-full max-w-2xl">
                        <div className="focus-within:border-purple-500/50 flex w-full flex-col rounded-lg border bg-white shadow-sm transition-colors">
                            <form onSubmit={handleSubmit} className="flex w-full items-end px-2.5">
                                <Button variant="ghost" size="icon" className="my-2.5" type="button" onClick={triggerBrowse}>
                                    <PaperclipIcon className="h-5 w-5" />
                                </Button>
                                <input ref={fileInputRef} type="file" hidden onChange={handleChange} multiple />
                                <textarea
                                    ref={textAreaRef}
                                    rows={1}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e as any);
                                        }
                                    }}
                                    placeholder="Ask anything..."
                                    className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0"
                                />
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="icon"
                                    className="my-2.5 text-purple-600"
                                    disabled={!input.trim() && files.length === 0}
                                    aria-label="Send message"
                                >
                                    <SendHorizontalIcon className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </div>
                     <div className="flex items-center justify-center gap-2 mt-4">
                        <Button variant="ghost" className="bg-gray-100/80 hover:bg-gray-200 text-gray-700 text-sm font-medium h-9 px-3" onClick={() => onStartChat("Today's Appointments")}>
                            Today's Appointments
                        </Button>
                        <Button variant="ghost" className="bg-gray-100/80 hover:bg-gray-200 text-gray-700 text-sm font-medium h-9 px-3" onClick={() => onStartChat("Pre/Post Instructions")}>
                            Pre/Post Instructions
                        </Button>
                    </div>
                </div>
            </div>
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
  
  const handleStartChat = (text: string) => {
    const newThreadId = uuidv4();
    const threadName = text || "Chat with attachments";

    if (text) {
      dispatch(
        addMessage({
          id: uuidv4(),
          threadId: newThreadId,
          sender: "user",
          text,
          createdAt: Date.now(),
        }),
      );
    }

    dispatch(addThread({ id: newThreadId, name: threadName, activate: true })); 
  };

  const handleNewChatClick = () => {
      dispatch(clearFiles());
      dispatch(setActiveThreadId(null));
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
            <WelcomeView onStartChat={handleStartChat} />
          )}
        </div>
      </main>
    </div>
  );
}
