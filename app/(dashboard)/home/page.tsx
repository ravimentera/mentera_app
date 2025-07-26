"use client";

import { Edit, PanelLeft, PanelRightClose, PanelRightOpen, Search } from "lucide-react";
import { FC, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/atoms";
import { Input } from "@/components/atoms/Input";
import { Tooltip } from "@/components/atoms/Tooltip";
import { DynamicLayoutContainer } from "@/components/organisms/DynamicLayoutContainer";
import { Thread } from "@/components/organisms/Thread";
import { TeraRuntimeProvider } from "@/components/organisms/chat/TeraRuntimeProvider";
import { AppDispatch, RootState } from "@/lib/store";
import { clear as clearFiles } from "@/lib/store/slices/fileUploadsSlice";
import {
  selectIsChatSidebarOpen,
  selectIsSidePanelExpanded,
  selectPatientDatabase,
  setIsChatSidebarOpen,
  toggleSidePanel,
} from "@/lib/store/slices/globalStateSlice";
import {
  addThread,
  clearThreadPatient,
  selectActiveThreadPatientId,
  setActiveThreadId,
} from "@/lib/store/slices/threadsSlice";
import { cn } from "@/lib/utils";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";

// The ChatClient component is now focused only on the chat UI.
const ChatClient: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { threads, activeThreadId } = useSelector((s: RootState) => s.threads);

  // State for the sidebar is now managed by Redux.
  const isChatSidebarOpen = useSelector(selectIsChatSidebarOpen);

  // State for the search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // These states are for the TeraRuntimeProvider
  const [isPatientContextEnabled, setIsPatientContextEnabled] = useState(true);
  const [forceFresh, setForceFresh] = useState(false);
  const [cacheDebug, setCacheDebug] = useState(false);

  // CHANGED: Use thread-specific patient ID instead of global
  const selectedId = useSelector(selectActiveThreadPatientId);
  const patientDB = useSelector(selectPatientDatabase);
  const defaultPatientId = Object.keys(patientDB)[0] as string;
  const currentPatientId = selectedId ?? defaultPatientId;

  useEffect(() => {
    if (!activeThreadId && threads.length === 0) {
      const newThreadId = uuidv4();
      dispatch(addThread({ id: newThreadId, name: "New Chat", activate: true }));
    } else if (!activeThreadId && threads.length > 0) {
      // biome-ignore lint/style/noNonNullAssertion: reason for ignoring
      dispatch(setActiveThreadId(threads[threads.length - 1]!.id));
    }
  }, [activeThreadId, threads, dispatch]);

  const handleNewChatClick = () => {
    dispatch(clearFiles());
    const newThreadId = uuidv4();
    dispatch(addThread({ id: newThreadId, name: "New Chat", activate: true }));
    // Clear any patient selection for the new thread
    dispatch(clearThreadPatient(newThreadId));
  };
  const handleSelectChat = (threadId: string) => {
    dispatch(clearFiles());
    dispatch(setActiveThreadId(threadId));
  };

  // Filter threads based on the search term and first message processing
  const filteredThreads = useMemo(() => {
    // Only show threads that have processed their first message
    const visibleThreads = threads.filter((thread) => thread.isFirstQueryProcessed === true);

    if (!searchTerm) return visibleThreads;
    
    const searchLower = searchTerm.toLowerCase();
    return visibleThreads.filter((thread) => {
      // Search in thread name (case-insensitive)
      const nameMatch = thread.name.toLowerCase().includes(searchLower);
      
      // Also search in original first message if available
      const originalMessageMatch = thread.originalFirstMessage 
        ? thread.originalFirstMessage.toLowerCase().includes(searchLower)
        : false;
      
      return nameMatch || originalMessageMatch;
    });
  }, [threads, searchTerm]);

  return (
    <div className="flex w-full h-full relative">
      <aside
        className={cn(
          "bg-slate-50 border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col h-full",
          isChatSidebarOpen ? "w-64" : "w-14",
        )}
      >
        <div className="p-2 flex justify-end">
          <Button
            onClick={() => dispatch(setIsChatSidebarOpen(!isChatSidebarOpen))}
            variant="ghost"
            size="icon"
            className="w-9 h-9 hover:bg-slate-200"
          >
            <PanelLeft className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        <div className={cn("flex-1 overflow-y-auto", !isChatSidebarOpen && "hidden")}>
          <div className="px-3 pb-4 space-y-4">
            <div className="space-y-2">
              <Button
                onClick={handleNewChatClick}
                variant="ghost"
                className="w-full justify-start gap-2.5 h-10 px-2 bg-slate-100 text-brand-blue hover:bg-slate-200"
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">New Chat</span>
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search chats and messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 h-10 bg-white"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="px-2 py-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recents
                </span>
              </div>
              <div className="space-y-1">
                {searchTerm && filteredThreads.length === 0 ? (
                  <div className="px-2 py-4 text-center">
                    <p className="text-xs text-gray-500">No chats found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  filteredThreads.map((thread) => {
                    // Check if the thread name should show a tooltip (longer than ~30 characters for sidebar)
                    const shouldShowTooltip = thread.name && thread.name.length > 30;
                    
                    // Create tooltip content that shows both the full title and original message if available
                    const tooltipContent = shouldShowTooltip ? (
                      <div className="max-w-xs">
                        <div className="font-medium">{thread.name}</div>
                        {thread.originalFirstMessage && thread.originalFirstMessage !== thread.name && (
                          <div className="text-xs opacity-75 mt-1">
                            Original: {thread.originalFirstMessage.length > 100 
                              ? thread.originalFirstMessage.substring(0, 100) + '...' 
                              : thread.originalFirstMessage}
                          </div>
                        )}
                      </div>
                    ) : thread.name;
                    
                    return (
                      <Tooltip 
                        key={thread.id}
                        content={tooltipContent} 
                        disabled={!shouldShowTooltip}
                        side="right"
                        align="start"
                      >
                        <Button
                          variant="ghost"
                          onClick={() => handleSelectChat(thread.id)}
                          className={cn(
                            "w-full justify-start h-9 px-2 text-gray-600 hover:bg-slate-100 text-sm",
                            activeThreadId === thread.id && "bg-slate-200 text-gray-800 font-semibold",
                          )}
                        >
                          <span className="truncate">{thread.name}</span>
                        </Button>
                      </Tooltip>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 bg-white">
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
};

// The Page component orchestrates the overall layout.
const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isSidePanelExpanded = useSelector(selectIsSidePanelExpanded);

  const isDynamicLayoutEnabled = useFeatureFlag("dynamicLayout");

  const handleToggleSidePanel = () => {
    dispatch(toggleSidePanel());
  };

  return (
    <div className="flex flex-1 h-full bg-gray-50/40 relative">
      <div
        className={cn(
          "h-full bg-background overflow-hidden transition-all duration-300 ease-in-out",
          isSidePanelExpanded ? "w-1/2" : "w-full",
        )}
      >
        <ChatClient />
      </div>

      {isSidePanelExpanded && isDynamicLayoutEnabled && (
        <div className="w-1/2 flex-shrink-0 bg-background overflow-hidden">
          <DynamicLayoutContainer />
        </div>
      )}

      <div className="absolute top-3 right-3 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleSidePanel}
          aria-label={isSidePanelExpanded ? "Collapse side panel" : "Expand side panel"}
          className="text-muted-foreground hover:text-foreground"
        >
          {isSidePanelExpanded ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default Page;
