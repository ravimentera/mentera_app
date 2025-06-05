"use client";

import { LayoutRenderer } from "@/components/organisms/LayoutRenderer";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

import { ChatMessageSkeleton } from "@/components/atoms";
// Import ShadCN Accordion components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/molecules";

// Import relevant selectors/types from the Redux slice
import type { LayoutEntry } from "@/lib/store/dynamicLayoutSlice"; // Import types
import {
  selectAllLayouts,
  selectIsLayoutLoading,
  selectLayoutError,
} from "@/lib/store/dynamicLayoutSlice";

export function DynamicLayoutContainer() {
  const allLayouts = useSelector(selectAllLayouts); // Array of LayoutEntry { key: string, data: LayoutAST }
  const isLoading = useSelector(selectIsLayoutLoading);
  const error = useSelector(selectLayoutError);

  // State to control which accordion item (identified by LayoutEntry.key) is open
  const [openAccordionItemKey, setOpenAccordionItemKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    // When allLayouts changes, set the latest layout entry's key as the open item.
    if (allLayouts && allLayouts.length > 0) {
      const latestLayoutEntry = allLayouts[allLayouts.length - 1];
      if (latestLayoutEntry?.key) {
        setOpenAccordionItemKey(latestLayoutEntry.key);
      }
    } else {
      setOpenAccordionItemKey(undefined); // No layouts, so no item is open
    }
  }, [allLayouts]); // Re-run this effect when the allLayouts array changes

  // useEffect(() => {
  //   console.log("DynamicLayoutContainer: All layouts from Redux store:", allLayouts);
  // }, [allLayouts]);

  // useEffect(() => {
  //   console.log("DynamicLayoutContainer: isLoading:", isLoading, "Error:", error);
  // }, [isLoading, error]);

  return (
    <div className="flex flex-col h-full p-4 space-y-4 bg-background text-foreground">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm">
          <p className="font-medium">Error loading layout:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1 pt-1">
        {" "}
        {/* Reduced space-y and pt */}
        {isLoading && allLayouts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">Loading layout data...</p>
            <ChatMessageSkeleton />
          </div>
        )}
        {!isLoading && allLayouts.length === 0 && !error && (
          <p className="text-muted-foreground text-sm text-center mt-6">
            No contextual layouts available. They will appear here when generated.
          </p>
        )}
        {/* The main Accordion that wraps all layout entries */}
        {allLayouts.length > 0 && (
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-2" // Space between accordion items
            value={openAccordionItemKey}
            onValueChange={setOpenAccordionItemKey}
          >
            {allLayouts.map((layoutEntry: LayoutEntry, index: number) => {
              // Use layoutEntry.key as the unique value for the AccordionItem.
              // Ensure these keys are reasonably unique and don't contain problematic characters
              // if they are very long markdown strings. For a demo, it might be okay.
              // A dedicated short ID on LayoutEntry would be more robust.
              const accordionItemValue = layoutEntry.key || `layout-entry-${index}-${uuid()}`;
              // Create a title for the accordion trigger
              const triggerTitle = layoutEntry.data.title;

              return (
                <AccordionItem
                  value={accordionItemValue}
                  key={accordionItemValue}
                  className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-card"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 dark:hover:bg-muted/30 w-full text-left text-card-foreground">
                    <span className="font-medium text-sm truncate" title={layoutEntry.key}>
                      {triggerTitle}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-0 pt-0 border-t dark:border-gray-700">
                    {" "}
                    {/* Remove padding from content, let LayoutRenderer handle it */}
                    {/* Pass the individual layout's data to LayoutRenderer */}
                    <LayoutRenderer layout={layoutEntry.data} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
        {isLoading && allLayouts.length > 0 && (
          <div className="flex items-center justify-center min-h-9 min-w-10 mt-4">
            <ChatMessageSkeleton />
          </div>
        )}
      </div>
    </div>
  );
}
