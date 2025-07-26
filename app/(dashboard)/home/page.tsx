"use client";

import { AppDispatch } from "@/lib/store";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/atoms";
import { DynamicLayoutContainer } from "@/components/organisms/DynamicLayoutContainer";
import ChatClient from "@/components/organisms/chat/ChatClient";
import { selectIsSidePanelExpanded, toggleSidePanel } from "@/lib/store/slices/globalStateSlice";
import { cn } from "@/lib/utils";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";

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
