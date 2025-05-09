"use client";

import { LayoutRenderer } from "@/components/layout-renderer/LayoutRenderer";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

import ChatMessageSkeleton from "@/components/skeletons/ChatMessageSkeleton";
// Import relevant selectors/types from the Redux slice
import {
  selectAllLayouts,
  selectIsLayoutLoading, // Global loading state from the slice
  selectLayoutError, // Global error state from the slice
  // selectCurrentMarkdownKey, // Optional: if you want to know which key is currently being fetched
} from "@/lib/store/dynamicLayoutSlice"; // Adjust path as needed
import type { ApiLayoutResponse, LayoutEntry } from "@/lib/store/dynamicLayoutSlice"; // Import types

// Placeholder for LayoutRenderer
// const LayoutRenderer = ({ layout, layoutKey }: { layout: ApiLayoutResponse, layoutKey?: string }) => (
//   <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800 mb-4">
//     <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
//       Rendered Layout {layoutKey && `(Key: ${layoutKey.substring(0,30)}...)`}
//     </h4>
//     <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
//       {JSON.stringify(layout, null, 2)}
//     </pre>
//   </div>
// );

export function DynamicLayoutContainer() {
  // Select relevant state from Redux store
  const allLayouts = useSelector(selectAllLayouts); // Array of LayoutEntry objects
  const isLoading = useSelector(selectIsLayoutLoading); // Boolean: true if any fetchDynamicLayout is pending
  const error = useSelector(selectLayoutError); // String or null: error message if any fetchDynamicLayout rejected

  // useEffect to log all stored layouts when the 'allLayouts' array changes
  useEffect(() => {
    console.log("DynamicLayoutContainer: All layouts from Redux store:", allLayouts);
  }, [allLayouts]);

  // useEffect to log loading and error states
  useEffect(() => {
    console.log("DynamicLayoutContainer: isLoading:", isLoading, "Error:", error);
  }, [isLoading, error]);

  return (
    <div className="flex flex-col h-full p-4 space-y-4 bg-background text-foreground">
      {/* Display error message from Redux state if a fetch operation failed */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm">
          <p className="font-medium">Error loading layout:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Render area for all fetched layouts */}
      <div className="flex-1 overflow-y-auto space-y-6 pt-4">
        {/* Show a global loading indicator if isLoading is true and no layouts are yet present */}
        {isLoading && allLayouts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">Loading layout data...</p>
            <ChatMessageSkeleton />
            {/* You could add a spinner component here */}
          </div>
        )}

        {/* Message if no layouts are loaded, not currently loading, and no error */}
        {!isLoading && allLayouts.length === 0 && !error && (
          <p className="text-muted-foreground text-sm text-center mt-6">
            No contextual layouts available. They will appear here when generated.
          </p>
        )}

        {/* Map over the layouts from the Redux store and render them */}
        <LayoutRenderer key={uuid()} layouts={allLayouts} />

        {/* Show a global loading indicator if isLoading is true and layout(s) is present */}
        {isLoading && allLayouts.length > 0 && (
          <div className="flex  items-center justify-center min-h-9 min-w-10">
            <ChatMessageSkeleton />
            {/* You could add a spinner component here */}
          </div>
        )}
      </div>
    </div>
  );
}
