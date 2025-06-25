"use client";

import { PanelLeftClose, PanelRightClose, XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/atoms";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DynamicLayoutContainer,
} from "@/components/organisms";
import ChatClient from "@/components/organisms/chat/ChatClient";
import type { AppDispatch } from "@/lib/store";
import {
  selectIsSidePanelExpanded,
  setSidePanelExpanded,
  toggleSidePanel,
} from "@/lib/store/slices/globalStateSlice";

export function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const isSidePanelExpandedGlobal = useSelector(selectIsSidePanelExpanded);

  const handleToggleSidePanel = () => {
    dispatch(toggleSidePanel());
  };

  const handleDrawerOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && isSidePanelExpandedGlobal) {
      dispatch(setSidePanelExpanded(false));
    }
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={handleDrawerOpenChange}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full z-50 shadow-lg hover:bg-blue-700 transition
                     p-0 w-13.5 h-13.5 flex items-center justify-center"
          aria-label="Open chat"
        >
          <Image
            src="/assets/icons/chat.png"
            width={54}
            height={54}
            alt="Tera Chat Button"
            className="rounded-full object-contain"
          />
        </Button>
      </DrawerTrigger>

      <DrawerContent
        direction="right"
        className={`flex flex-col ${
          isSidePanelExpandedGlobal
            ? "w-[90vw] sm:w-[80vw] md:w-[75vw] lg:w-[70vw] xl:w-[calc(100vw-200px)] max-w-[1200px]"
            : "w-[90vw] sm:w-[50vw] md:w-[40vw] lg:w-[33vw]"
        }`}
      >
        <DrawerHeader className="shrink-0 flex items-center border-b dark:border-gray-700 p-4 flex-row">
          <div className="flex-grow">
            <DrawerTitle className="text-lg font-semibold text-left">Talk to Tera</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground text-left">
              Your smart assistant.
            </DrawerDescription>
          </div>

          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleSidePanel}
              aria-label={isSidePanelExpandedGlobal ? "Collapse side panel" : "Expand side panel"}
              className="text-muted-foreground hover:text-foreground"
            >
              {isSidePanelExpandedGlobal ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelRightClose className="h-5 w-5" />
              )}
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Close drawer"
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex flex-1 h-full overflow-hidden">
          {isSidePanelExpandedGlobal && (
            <div className="w-3/5 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 bg-background overflow-hidden">
              <DynamicLayoutContainer />
            </div>
          )}
          <div
            className={`${
              isSidePanelExpandedGlobal ? "w-2/5" : "w-full"
            } h-full bg-background overflow-hidden`}
          >
            <ChatClient />
          </div>
        </div>

        <DrawerFooter className="shrink-0 hidden p-4 border-t dark:border-gray-700"></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
