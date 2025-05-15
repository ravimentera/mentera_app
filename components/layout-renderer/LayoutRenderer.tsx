"use client";

import ComponentErrorBoundary from "@/components/organisms/ComponentErrorBoundary"; // Assuming this path is correct
import React from "react";
import { v4 as uuid } from "uuid";
import { componentMap } from "./components"; // Assuming this path is correct

// Type definitions (ensure these match your AST structure)
type LayoutAST = {
  type: "Layout";
  layout: GridNode[]; // An array of grid definitions
};

type GridNode = {
  type: "Grid";
  // 'columns' and 'gap' from AST are now used for sub-grid styling if a component itself renders a grid,
  // but not for the main 2-column layout of LayoutRenderer.
  columns?: number; // Optional, as we default to 2 columns for the main layout
  gap?: number; // Optional, we'll use a default gap
  rows: RowNode[];
  id?: string; // Still useful for keys
  title?: string; // Still useful for context if this LayoutRenderer is part of an Accordion
};

type RowNode = {
  type: "Row";
  components: ComponentNode[];
};

type ComponentNode = {
  type: "Component";
  name: string;
  props: Record<string, any>;
  // Optional: A new property to explicitly control spanning in the AST
  // spanFullWidth?: boolean;
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

// Define which components should span the full width (both columns)
// Add the names of your components that need to span full width.
const FULL_WIDTH_COMPONENTS = new Set(["AppointmentCalendar"]);

export function LayoutRenderer({
  layout,
}: {
  layout: LayoutAST | null | undefined;
}) {
  if (!layout || !layout.layout || layout.layout.length === 0) {
    console.warn("LayoutRenderer: Received null, undefined, or empty layout data.");
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Content not available for this section.
      </div>
    );
  }

  // 1. Flatten all components from all grids and rows into a single list.
  // Each item in this list will be a direct child of the main 2-column grid.
  const allRenderableComponents: (ComponentNode & { uniqueKey: string })[] = [];
  layout.layout.forEach((grid, gridIndex) => {
    const gridKeyPart = grid.id || `grid-${gridIndex}`;
    grid.rows.forEach((row, rowIndex) => {
      row.components.forEach((componentNode, componentIndex) => {
        // Create a more stable unique key for each component instance
        const uniqueKey = `comp-${gridKeyPart}-row-${rowIndex}-comp-${componentIndex}-${componentNode.name}-${uuid()}`;
        allRenderableComponents.push({ ...componentNode, uniqueKey });
      });
    });
  });

  if (allRenderableComponents.length === 0) {
    // This case might occur if grids/rows exist but contain no components after de-duplication
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No components to render in this layout section.
      </div>
    );
  }

  // 2. Render all extracted components in a single grid, defaulting to 2 columns.
  //    Components can span full width based on their name.
  return (
    <div className="p-4">
      {" "}
      {/* Overall padding for the content rendered by LayoutRenderer */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6" // Default to 1 col on small, 2 cols on md+
      >
        {allRenderableComponents.map((componentNode) => {
          const ComponentToRender = componentMap[componentNode.name];

          if (!ComponentToRender) {
            return (
              <div key={componentNode.uniqueKey} className="p-2 md:col-span-2">
                {" "}
                {/* Unknown components can take full width for visibility */}
                <UnknownComponentFallback componentName={componentNode.name} />
              </div>
            );
          }

          // Determine if the component should span both columns
          const spanFullWidth = FULL_WIDTH_COMPONENTS.has(componentNode.name);
          // Alternative: Check for an explicit prop from AST:
          // const spanFullWidth = componentNode.spanFullWidth === true || FULL_WIDTH_COMPONENTS.has(componentNode.name);

          return (
            <div
              key={componentNode.uniqueKey}
              className={`p-2 min-w-0 ${spanFullWidth ? "md:col-span-2" : ""}`} // Apply col-span-2 on md+ screens if full width
            >
              <ComponentErrorBoundary componentName={componentNode.name}>
                <ComponentToRender {...componentNode.props} />
              </ComponentErrorBoundary>
            </div>
          );
        })}
      </div>
    </div>
  );
}
