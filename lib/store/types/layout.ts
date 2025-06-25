export interface LayoutComponent {
  type: "Component";
  name: string;
  props: Record<string, any>;
}

export interface LayoutRow {
  type: "Row";
  components: LayoutComponent[];
}

export interface LayoutGrid {
  type: "Grid";
  columns: number;
  gap: number;
  rows: LayoutRow[];
}

export interface ApiLayoutResponse {
  type: "Layout";
  layout: LayoutGrid[];
  title: string;
}

export interface LayoutEntry {
  key: string;
  data: ApiLayoutResponse;
}

export interface DynamicLayoutState {
  layouts: LayoutEntry[];
  isLoading: boolean;
  error: string | null;
  currentMarkdownKey: string | null;
}

// Define the type for the thunk API
export interface ThunkApiConfig {
  dispatch: any; // Will be properly typed with AppDispatch when imported
  state: any; // Will be properly typed with RootState when imported
  rejectValue: string; // The type of the value returned by rejectWithValue
}
