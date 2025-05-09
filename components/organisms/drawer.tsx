import { Button } from "@/components/atoms";
import { DynamicLayoutContainer } from "@/components/layout-renderer/DynamicLayoutContainer";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  selectIsSidePanelExpanded,
  setSidePanelExpanded,
  toggleSidePanel,
} from "@/lib/store/globalStateSlice";
import Image from "next/image";
import { useState } from "react";
// Import Redux hooks and actions/selectors from globalStateSlice
import { useDispatch, useSelector } from "react-redux";
import ChatClient from "./chat/ChatClient";

import type { AppDispatch, RootState } from "@/lib/store";

// Import icons for the toggle button
import { PanelLeftClose, PanelRightClose, XIcon } from "lucide-react";

export function DrawerComponent() {
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
                     p-0 w-[54px] h-[54px] flex items-center justify-center"
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
        isExpanded={isSidePanelExpandedGlobal}
        // Added transition classes here explicitly to ensure they apply to width changes.
        // The base ShadCN component should already have these, but this makes it certain.
        className={`flex flex-col h-full transition-all duration-300 ease-in-out 
                    ${
                      isSidePanelExpandedGlobal
                        ? "w-full sm:w-11/12 md:w-5/6 lg:w-3/4 xl:w-[calc(100vw-200px)] max-w-[1200px]"
                        : "w-full sm:w-1/2 md:w-2/5 lg:w-4/12"
                    }`}
      >
        <DrawerHeader className="shrink-0 flex items-center border-b dark:border-gray-700 p-4 flex-row">
          {/* Group for Title and Description on the left - this will grow */}
          <div className="flex-grow">
            <DrawerTitle className="text-lg font-semibold text-left">Talk to Tera</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground text-left">
              Your smart assistant.
            </DrawerDescription>
          </div>

          {/* Group for Action Buttons on the right - will not grow or shrink, pushed by the left group */}
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
