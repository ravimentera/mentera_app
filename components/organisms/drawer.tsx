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
import Image from "next/image";
import { useState } from "react";
import ChatClient from "./chat/ChatClient";

import type { AppDispatch, RootState } from "@/lib/store";
import {
  selectIsSidePanelExpanded, // Selector to get the side panel state
  setSidePanelExpanded, // Action to explicitly set the side panel state
  toggleSidePanel, // Action to toggle the side panel
} from "@/lib/store/globalStateSlice"; // Adjust path as needed
// Import Redux hooks and actions/selectors from globalStateSlice
import { useDispatch, useSelector } from "react-redux";

// Import icons for the toggle button
import { PanelLeftClose, PanelRightClose, XIcon } from "lucide-react";

export function DrawerComponent() {
  // Local state for managing the drawer's own open/close visibility
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  // Get isSidePanelExpanded state from the Redux store
  const isSidePanelExpandedGlobal = useSelector(selectIsSidePanelExpanded);

  // Handler to toggle the side panel using the Redux action
  const handleToggleSidePanel = () => {
    dispatch(toggleSidePanel());
  };

  // Handler for when the drawer's open state changes (e.g., closed via overlay click, escape key)
  const handleDrawerOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && isSidePanelExpandedGlobal) {
      // If the drawer is being closed AND the side panel was expanded,
      // dispatch an action to collapse the side panel as well.
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
            src="/assets/icons/chat.png" // Ensure this path is correct
            width={54}
            height={54}
            alt="Tera Chat Button"
            className="rounded-full object-contain"
          />
        </Button>
      </DrawerTrigger>

      {/* DrawerContent's width is controlled by the global isSidePanelExpandedGlobal state */}
      <DrawerContent
        className={`flex flex-col h-full transition-all duration-300 ease-in-out
                    ${
                      isSidePanelExpandedGlobal
                        ? "md:w-[80vw] lg:w-[70vw] xl:w-[1000px]"
                        : "md:w-[50vw] lg:w-[40vw] xl:w-[450px]"
                    }`}
      >
        <DrawerHeader className="shrink-0 flex justify-between items-start border-b dark:border-gray-700 p-4">
          {/* Empty div for spacing, pushes content to the right */}
          <div className="flex-grow"></div>
          {/* Group for Title, Description, and Action Buttons on the right */}
          <div className="flex flex-col items-end text-right ml-4">
            <div className="flex items-center gap-2 mb-1">
              {/* Expand/Collapse Button for the side panel */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleSidePanel} // Dispatches Redux action
                aria-label={isSidePanelExpandedGlobal ? "Collapse side panel" : "Expand side panel"}
                className="text-muted-foreground hover:text-foreground"
              >
                {isSidePanelExpandedGlobal ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelRightClose className="h-5 w-5" />
                )}
              </Button>
              {/* Drawer Close Button */}
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close drawer"
                  className="text-muted-foreground hover:text-foreground"
                  // The onOpenChange handler already takes care of collapsing the side panel when drawer closes
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
            <DrawerTitle className="text-lg font-semibold">Talk to Tera</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              Your smart assistant.
            </DrawerDescription>
          </div>
        </DrawerHeader>

        {/* Main content area: flex container for side panel and chat client */}
        <div className="flex flex-1 h-full overflow-hidden">
          {/* Left Side Panel (DynamicLayoutContainer) - visibility controlled by global state */}
          {isSidePanelExpandedGlobal && (
            <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 bg-background overflow-hidden">
              {/* DynamicLayoutContainer is expected to manage its own padding and scrolling */}
              <DynamicLayoutContainer />
            </div>
          )}

          {/* Right Panel (ChatClient) - width adjusts based on global state */}
          <div
            className={`${
              isSidePanelExpandedGlobal ? "w-1/2" : "w-full"
            } h-full bg-background overflow-hidden`}
          >
            {/* ChatClient should be designed to fill its container and handle internal scrolling */}
            <ChatClient />
          </div>
        </div>

        {/* Footer is hidden as per original code, but kept for structure */}
        <DrawerFooter className="shrink-0 hidden p-4 border-t dark:border-gray-700">
          {/* Footer content can go here if needed */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
