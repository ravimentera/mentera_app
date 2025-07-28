"use client";

import { AppDispatch } from "@/lib/store";
import { PanelLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/atoms";
import { DynamicLayoutContainer } from "@/components/organisms/DynamicLayoutContainer";
import { ThreadList } from "@/components/organisms/ThreadList";
import ChatClient from "@/components/organisms/chat/ChatClient";
import {
  selectIsChatSidebarOpen,
  selectIsSidePanelExpanded,
  setIsChatSidebarOpen,
  toggleSidePanel,
} from "@/lib/store/slices/globalStateSlice";
import { cn } from "@/lib/utils";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";

// The Page component orchestrates the overall layout.
const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isSidePanelExpanded = useSelector(selectIsSidePanelExpanded);
  const isChatSidebarOpen = useSelector(selectIsChatSidebarOpen);
  const isDynamicLayoutEnabled = useFeatureFlag("dynamicLayout");

  const handleToggleSidePanel = () => {
    dispatch(toggleSidePanel());
  };

  const handleToggleSidebar = () => {
    dispatch(setIsChatSidebarOpen(!isChatSidebarOpen));
  };

  return (
    <div className="flex flex-1 h-full bg-gray-50/40 relative">
      {/* Chat Sidebar */}
      <aside
        className={cn(
          "bg-slate-50 border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col h-full",
          isChatSidebarOpen ? "w-64" : "w-14",
        )}
      >
        {/* Sidebar Toggle Button */}
        <div className="p-2 flex justify-end">
          <Button
            onClick={handleToggleSidebar}
            variant="ghost"
            size="icon"
            className="w-9 h-9 hover:bg-slate-200"
          >
            <PanelLeft className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {/* Thread List Content */}
        <div className={cn("flex-1 overflow-y-auto", !isChatSidebarOpen && "hidden")}>
          <ThreadList sidebarMode={true} />
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

      {/* Dynamic Layout Side Panel */}
      {isSidePanelExpanded && isDynamicLayoutEnabled && (
        <div className="w-1/2 flex-shrink-0 bg-background overflow-hidden">
          <DynamicLayoutContainer />
        </div>
      )}

      {/* Side Panel Toggle Button */}
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
