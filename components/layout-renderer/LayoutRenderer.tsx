import { v4 as uuid } from "uuid";
import { componentMap } from "./components";

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

export function LayoutRenderer({ layout }: { layout: LayoutAST }) {
  return layout.layout.map((grid) => (
    <div key={uuid()} className={`grid grid-cols-${grid.columns} gap-${grid.gap}`}>
      {grid.rows.map((row) => (
        <div key={uuid()} className="contents">
          {row.components.map((component) => {
            const Component = componentMap[component.name];
            if (!Component) return <div key={uuid()}>Unknown component: {component.name}</div>;
            return (
              <div key={uuid()} className="p-2">
                <Component {...component.props} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  ));
}
