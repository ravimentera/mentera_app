"use client";

import ComponentErrorBoundary from "@/components/organisms/ComponentErrorBoundary";
import type { LayoutEntry } from "@/lib/store/dynamicLayoutSlice";
import React from "react";
import { v4 as uuid } from "uuid";
import { componentMap } from "./components";

type ComponentNode = {
  type: "Component";
  name: string;
  props: Record<string, any>;
};
// Fallback UI for an unknown component
const UnknownComponentFallback = ({ componentName }: { componentName: string }) => (
  <div className="p-4 my-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md shadow-sm w-full">
    <h3 className="font-bold text-md">Unknown Component</h3>
    <p className="text-sm">
      The component named "<strong>{componentName}</strong>" could not be found.
    </p>
    <p className="text-xs mt-1">
      Please check the layout configuration and ensure the component is correctly registered in
      `componentMap`.
    </p>
  </div>
);

// Props for the LayoutRenderer - now accepts an array of LayoutEntry
interface LayoutRendererProps {
  layouts: LayoutEntry[] | null | undefined;
}

export function LayoutRenderer({ layouts }: LayoutRendererProps) {
  // Handle cases where layouts array might be null, undefined, or empty
  if (!layouts || layouts.length === 0) {
    console.warn("LayoutRenderer: Received null, undefined, or empty layouts array.");
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No layout data to display.
      </div>
    );
  }

  // 1. Flatten all components from all layout entries into a single list
  const allComponents: (ComponentNode & { parentLayoutKey: string })[] = [];
  layouts.forEach((layoutEntry) => {
    if (layoutEntry?.data?.layout) {
      layoutEntry.data.layout.forEach((grid) => {
        grid.rows.forEach((row) => {
          row.components.forEach((componentNode) => {
            allComponents.push({ ...componentNode, parentLayoutKey: layoutEntry.key });
          });
        });
      });
    }
  });

  if (allComponents.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No components to render from the provided layouts.
      </div>
    );
  }

  // 2. Render all extracted components in a single 2-column grid
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1" // Always 2 columns on medium screens and up, 1 on small
    >
      {allComponents.map((componentNode, index) => {
        const Component = componentMap[componentNode.name];
        // Using a combination of parent key, component name, and index for a more stable key
        const componentKey = `flat-comp-${componentNode.parentLayoutKey.substring(0, 10)}-${componentNode.name}-${index}-${uuid()}`;

        if (!Component) {
          return (
            <div key={componentKey} className="p-2 min-w-0">
              {" "}
              {/* Wrapper for unknown component fallback */}
              <UnknownComponentFallback componentName={componentNode.name} />
            </div>
          );
        }

        // Each component is wrapped in the ErrorBoundary
        return (
          <div key={componentKey} className="p-1 min-w-0">
            {" "}
            {/* Minimal padding around component wrapper */}
            <ComponentErrorBoundary componentName={componentNode.name}>
              <Component {...componentNode.props} />
            </ComponentErrorBoundary>
          </div>
        );
      })}
    </div>
  );
}
