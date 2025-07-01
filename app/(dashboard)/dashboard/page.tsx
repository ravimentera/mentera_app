"use client";

import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { Edit, PanelLeft, Search } from "lucide-react";

import { Button } from "@/components/atoms";
import { TeraRuntimeProvider } from "@/components/organisms/chat/TeraRuntimeProvider";
import { Thread } from "@/components/organisms/Thread";
import { AppDispatch, RootState } from "@/lib/store";
import { clear as clearFiles } from "@/lib/store/slices/fileUploadsSlice";
import { addThread, setActiveThreadId } from "@/lib/store/slices/threadsSlice";
import { cn } from "@/lib/utils";

// TypeScript Interfaces for Props
interface ChatClientProps {
  // This component doesn't receive props, but it's good practice to define it.
}
const ChatClient: FC<ChatClientProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { threads, activeThreadId } = useSelector((s: RootState) => s.threads);

  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);
  const [isPatientContextEnabled, setIsPatientContextEnabled] = useState(true);
  const [forceFresh, setForceFresh] = useState(false);
  const [cacheDebug, setCacheDebug] = useState(false);

  // This effect ensures a thread is always active, allowing the WebSocket to connect on load.
  useEffect(() => {
    if (!activeThreadId && threads.length === 0) {
      const newThreadId = uuidv4();
      dispatch(addThread({ id: newThreadId, name: "New Chat", activate: true }));
    } else if (!activeThreadId && threads.length > 0) {
      // If no thread is active but threads exist, activate the most recent one.
      dispatch(setActiveThreadId(threads[threads.length - 1]!.id));
    }
  }, [activeThreadId, threads, dispatch]);

  const handleNewChatClick = () => {
    dispatch(clearFiles());
    const newThreadId = uuidv4();
    dispatch(addThread({ id: newThreadId, name: "New Chat", activate: true }));
  };
  const handleSelectChat = (threadId: string) => {
    dispatch(clearFiles());
    dispatch(setActiveThreadId(threadId));
  };

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
        {/* Topbar has been removed */}
        <div className="flex-1 min-h-0">
          {activeThreadId ? (
            <TeraRuntimeProvider
              activeThreadId={activeThreadId}
              isPatientContextEnabled={isPatientContextEnabled}
              forceFresh={forceFresh}
              cacheDebug={cacheDebug}
            >
              <div className="h-full">
                <Thread />
              </div>
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

export default ChatClient;
