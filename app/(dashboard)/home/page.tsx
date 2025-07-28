"use client";

import { AppDispatch, RootState } from "@/lib/store";
import { Edit, PanelLeft, PanelRightClose, PanelRightOpen, Search } from "lucide-react";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/atoms";
import { Input } from "@/components/atoms/Input";
import { Tooltip } from "@/components/atoms/Tooltip";
import { DynamicLayoutContainer } from "@/components/organisms/DynamicLayoutContainer";
import ChatClient from "@/components/organisms/chat/ChatClient";
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

// The Page component orchestrates the overall layout.
const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isSidePanelExpanded = useSelector(selectIsSidePanelExpanded);
  const isDynamicLayoutEnabled = useFeatureFlag("dynamicLayout");

  // Chat sidebar state and logic (moved from ChatClient)
  const { threads, activeThreadId } = useSelector((s: RootState) => s.threads);
  const isChatSidebarOpen = useSelector(selectIsChatSidebarOpen);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Filter threads based on search term and first message processing
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

  // Handle new chat creation
  const handleNewChatClick = () => {
    dispatch(clearFiles());
    const newThreadId = uuidv4();
    dispatch(addThread({ id: newThreadId, name: "New Chat", activate: true }));
    // Clear any patient selection for the new thread
    dispatch(clearThreadPatient(newThreadId));
  };

  // Handle thread selection
  const handleSelectChat = (threadId: string) => {
    dispatch(clearFiles());
    dispatch(setActiveThreadId(threadId));
  };

  const handleToggleSidePanel = () => {
    dispatch(toggleSidePanel());
  };

  return (
    <div className="flex flex-1 h-full bg-gray-50/40 relative">
      {/* Chat Sidebar (moved from ChatClient) */}
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
                        {thread.originalFirstMessage &&
                          thread.originalFirstMessage !== thread.name && (
                            <div className="text-xs opacity-75 mt-1">
                              Original:{" "}
                              {thread.originalFirstMessage.length > 100
                                ? thread.originalFirstMessage.substring(0, 100) + "..."
                                : thread.originalFirstMessage}
                            </div>
                          )}
                      </div>
                    ) : (
                      thread.name
                    );

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
                            activeThreadId === thread.id &&
                              "bg-slate-200 text-gray-800 font-semibold",
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

      {/* Main Chat Area */}
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

      {isDynamicLayoutEnabled && (
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
      )}
    </div>
  );
};

export default Page;
