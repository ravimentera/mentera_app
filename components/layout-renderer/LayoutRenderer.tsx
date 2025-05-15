"use client";

import ComponentErrorBoundary from "@/components/organisms/ComponentErrorBoundary";
import React from "react";
import { v4 as uuid } from "uuid";
import { componentMap } from "./components";

// Type definitions
type LayoutAST = {
  type: "Layout";
  layout: GridNode[];
};

type GridNode = {
  type: "Grid";
  columns: number;
  gap: number;
  rows: RowNode[];
};

type RowNode = {
  type: "Row";
  components: ComponentNode[];
};

type ComponentNode = {
  type: "Component";
  name: string;
  props: Record<string, any>;
};

// Fallback UI for an unknown component
const UnknownComponentFallback = ({
  componentName,
}: {
  componentName: string;
}) => (
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

export function LayoutRenderer({
  layout,
}: {
  layout: LayoutAST | null | undefined;
}) {
  // Handle cases where layout might be null or undefined, or layout.layout is empty
  if (!layout || !layout.layout || layout.layout.length === 0) {
    console.warn("LayoutRenderer: Received null, undefined, or empty layout data.");
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No layout data to display.
      </div>
    );
  }

  return layout.layout.map((grid) => (
    // Using grid.columns for Tailwind CSS requires dynamic class generation.
    // Ensure Tailwind setup can handle this (e.g., JIT mode or safelisting if needed).
    // For simplicity, assuming it works. A more robust way might be to use inline styles for grid-template-columns.
    <div
      key={grid.type + "-" + uuid()} // Using a more descriptive key, consider stable IDs if available
      className="grid gap-6" // Using a fixed gap for simplicity, grid.gap can be passed as style
      style={{
        gridTemplateColumns: `repeat(${grid.rows.length > 1 ? grid.columns : 1}, minmax(0, 1fr))`,
        gap: `${grid.gap || 24}px`,
      }}
    >
      {grid.rows.map((row, rowIndex) => (
        // Using React.Fragment as the key should be on the actual mapped elements if they are direct children of grid.
        // If row.components are meant to be grouped, this div wrapper is fine.
        // The key for the row should also be stable if possible.
        <React.Fragment key={`row-${rowIndex}-${uuid()}`}>
          {row.components.map((componentNode, componentIndex) => {
            const Component = componentMap[componentNode.name];
            const componentKey = `comp-${
              componentNode.name
            }-${rowIndex}-${componentIndex}-${uuid()}`;

            if (!Component) {
              return (
                <div key={componentKey} className="p-2">
                  {" "}
                  {/* Wrapper for unknown component fallback */}
                  <UnknownComponentFallback componentName={componentNode.name} />
                </div>
              );
            }

            // Each component is wrapped in the ErrorBoundary
            return (
              <div key={componentKey} className="p-2 min-w-0">
                {" "}
                {/* Added min-w-0 for flex/grid item overflow handling */}
                <ComponentErrorBoundary componentName={componentNode.name}>
                  <Component {...componentNode.props} />
                </ComponentErrorBoundary>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  ));
}
