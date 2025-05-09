import { PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setSidePanelExpanded } from "./globalStateSlice";
import type { AppDispatch, RootState } from "./index";

// Define TypeScript interfaces for the layout structure based on your example
interface LayoutComponent {
  type: "Component";
  name: string;
  props: Record<string, any>;
}

interface LayoutRow {
  type: "Row";
  components: LayoutComponent[];
}

interface LayoutGrid {
  type: "Grid";
  columns: number;
  gap: number;
  rows: LayoutRow[];
}

export interface ApiLayoutResponse {
  type: "Layout";
  layout: LayoutGrid[];
}

export interface LayoutEntry {
  key: string; // Unique identifier (e.g., the markdown string)
  data: ApiLayoutResponse;
}

export interface DynamicLayoutState {
  layouts: LayoutEntry[];
  isLoading: boolean;
  error: string | null;
  currentMarkdownKey: string | null;
}

const initialState: DynamicLayoutState = {
  layouts: [],
  isLoading: false,
  error: null,
  currentMarkdownKey: null,
};

// Define the type for the thunk API
interface ThunkApiConfig {
  dispatch: AppDispatch;
  state: RootState;
  rejectValue: string;
}

export const fetchDynamicLayout = createAsyncThunk<LayoutEntry, string, ThunkApiConfig>(
  "dynamicLayout/fetchLayout",
  async (markdownKey, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSidePanelExpanded(true));
      const response = await fetch("/api/layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markdown: markdownKey.trim() }),
      });

      if (!response.ok) {
        let errorMsg = `Failed to fetch layout: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData?.message) {
            errorMsg = errorData.message;
          }
        } catch (e) {
          /* Ignore */
        }
        return rejectWithValue(errorMsg);
      }

      const data: ApiLayoutResponse = await response.json();

      return { key: markdownKey, data };
    } catch (error: any) {
      dispatch(setSidePanelExpanded(false));
      return rejectWithValue(error.message || "An unknown error occurred while fetching layout");
    }
  },
);

export const dynamicLayoutSlice = createSlice({
  name: "dynamicLayout",
  initialState,
  reducers: {
    clearLayout: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        state.layouts = state.layouts.filter((layout) => layout.key !== action.payload);
        if (state.currentMarkdownKey === action.payload) {
          state.currentMarkdownKey = null;
          state.isLoading = false;
          state.error = null;
        }
      } else {
        state.layouts = [];
        state.currentMarkdownKey = null;
        state.isLoading = false;
        state.error = null;
      }
    },
    setCurrentMarkdownKey: (state, action: PayloadAction<string | null>) => {
      state.currentMarkdownKey = action.payload;
      if (action.payload === null || !state.layouts.find((l) => l.key === action.payload)) {
        state.isLoading = false;
        state.error = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDynamicLayout.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.currentMarkdownKey = action.meta.arg; // markdownKey
      })
      .addCase(fetchDynamicLayout.fulfilled, (state, action: PayloadAction<LayoutEntry>) => {
        state.isLoading = false;
        state.error = null;

        const newLayoutEntry = action.payload;
        const newLayoutKey = newLayoutEntry.key;
        const newLayoutData = newLayoutEntry.data;

        // 1. Extract all component names from the new layout
        const newComponentNames = new Set<string>();
        newLayoutData.layout.forEach((grid) => {
          grid.rows.forEach((row) => {
            row.components.forEach((component) => {
              newComponentNames.add(component.name);
            });
          });
        });
        console.log("New layout component names:", Array.from(newComponentNames));

        // 2. Filter out these components from all *other* existing layouts
        state.layouts = state.layouts.map((existingEntry) => {
          // Skip the layout that is about to be updated/added itself
          if (existingEntry.key === newLayoutKey) {
            return existingEntry; // Will be replaced entirely later if it's an update
          }

          // Create a deep copy to modify, or rely on Immer for nested updates
          // For simplicity with Immer, we can modify nested structures directly.
          const updatedGrids = existingEntry.data.layout.map((grid) => ({
            ...grid,
            rows: grid.rows.map((row) => ({
              ...row,
              components: row.components.filter(
                (component) => !newComponentNames.has(component.name),
              ),
            })),
          }));

          // Filter out rows that become empty after component removal
          const gridsWithNonEmptyRows = updatedGrids.map((grid) => ({
            ...grid,
            rows: grid.rows.filter((row) => row.components.length > 0),
          }));

          // Filter out grids that become empty after row removal
          const finalGrids = gridsWithNonEmptyRows.filter((grid) => grid.rows.length > 0);

          if (
            finalGrids.length < existingEntry.data.layout.length ||
            updatedGrids.some(
              (ug, i) => ug.rows.length < existingEntry.data.layout[i].rows.length,
            ) ||
            updatedGrids.some((ug, i) =>
              ug.rows.some(
                (ur, j) =>
                  ur.components.length < existingEntry.data.layout[i].rows[j].components.length,
              ),
            )
          ) {
            console.log(
              `De-duplicating components from existing layout (key: ${existingEntry.key}) based on new layout (key: ${newLayoutKey})`,
            );
          }

          return {
            ...existingEntry,
            data: {
              ...existingEntry.data,
              layout: finalGrids,
            },
          };
        });

        // 3. Add or update the new layout entry
        const existingLayoutIndex = state.layouts.findIndex(
          (layout) => layout.key === newLayoutKey,
        );
        if (existingLayoutIndex !== -1) {
          console.log(`Updating existing layout for key: ${newLayoutKey}`);
          state.layouts[existingLayoutIndex] = newLayoutEntry;
        } else {
          console.log(`Adding new layout for key: ${newLayoutKey}`);
          state.layouts.push(newLayoutEntry);
        }
      })
      .addCase(fetchDynamicLayout.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload;
        } else if (action?.error?.message) {
          state.error = action.error.message;
        } else {
          state.error = "Failed to fetch layout due to an unknown error.";
        }
      });
  },
});

export const { clearLayout, setCurrentMarkdownKey } = dynamicLayoutSlice.actions;

export const selectAllLayouts = (state: RootState) => state.dynamicLayout.layouts;
// export const selectLayoutDataByKey = (state: RootState, key: string): ApiLayoutResponse | undefined => {
//   const layoutEntry = state.layouts.find(layout => layout.key === key);
//   return layoutEntry?.data;
// };
// export const selectLayoutEntryByKey = (state: RootState, key: string): LayoutEntry | undefined => {
//   return state.layouts.find(layout => layout.key === key);
// };
export const selectIsLayoutLoading = (state: RootState) => state.dynamicLayout.isLoading;
export const selectLayoutError = (state: RootState) => state.dynamicLayout.error;
export const selectCurrentMarkdownKey = (state: RootState) =>
  state.dynamicLayout.currentMarkdownKey;

export default dynamicLayoutSlice.reducer;
