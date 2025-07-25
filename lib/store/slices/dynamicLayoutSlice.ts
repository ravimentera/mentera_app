import { isFeatureEnabled } from "@/lib/featureFlags";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { ApiLayoutResponse, DynamicLayoutState, LayoutEntry, ThunkApiConfig } from "../types";
import {
  getStreamingUISessionId,
  setIsChatSidebarOpen,
  setSidePanelExpanded,
} from "./globalStateSlice";

const initialState: DynamicLayoutState = {
  layouts: [],
  isLoading: false,
  error: null,
  currentMarkdownKey: null,
};

export const fetchDynamicLayout = createAsyncThunk<
  LayoutEntry, // Return type of the payload creator
  string, // First argument to the payload creator (markdownKey)
  ThunkApiConfig // Type for thunkAPI
>("dynamicLayout/fetchLayout", async (markdownKey, thunkAPI) => {
  if (!isFeatureEnabled("dynamicLayout")) {
    return thunkAPI.rejectWithValue("Dynamic layout feature is disabled");
  }

  try {
    const { dispatch, getState, rejectWithValue } = thunkAPI;
    const activeThreadId = (getState() as RootState).threads.activeThreadId;
    // @ts-ignore
    const activePatientID = (getState() as RootState).threads.threads[activeThreadId]
      .selectedPatientId;
    const latestUserMessage = (getState() as RootState).messages.items
      .filter((message) => message.sender === "user")
      .at(-1)?.text;

    // @TODO: Remove the HARDCODED IDs
    const providerId = "PR-2001";
    const medspaId = "MS-1001";

    if (!activePatientID) throw new Error("No active patient ID found");

    const sessionId = getStreamingUISessionId(getState());
    dispatch(setSidePanelExpanded(true));
    dispatch(setIsChatSidebarOpen(false));
    const response = await fetch("/api/layout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        markdown: markdownKey.trim(),
        sessionId,
        providerId,
        medspaId,
        activePatientID,
        latestUserMessage,
      }),
    });

    if (!response.ok) {
      let errorMsg = `Failed to fetch layout: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {
        /* Ignore if response body isn't JSON */
      }
      return rejectWithValue(errorMsg);
    }

    const data: ApiLayoutResponse = await response.json();

    return { key: markdownKey, data };
  } catch (error: any) {
    const { dispatch, rejectWithValue } = thunkAPI;
    dispatch(setSidePanelExpanded(false));
    // For other unexpected errors, ensure a string is returned
    return rejectWithValue(error.message || "An unknown error occurred while fetching layout");
  }
});

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
        state.currentMarkdownKey = action.meta.arg;
      })
      .addCase(fetchDynamicLayout.fulfilled, (state, action: PayloadAction<LayoutEntry>) => {
        state.isLoading = false;
        state.error = null;
        const { key, data } = action.payload;
        const existingLayoutIndex = state.layouts.findIndex((layout) => layout.key === key);

        if (existingLayoutIndex !== -1) {
          state.layouts[existingLayoutIndex] = { key, data };
        } else {
          state.layouts.push({ key, data });
        }
      })
      .addCase(fetchDynamicLayout.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          // If rejectWithValue was called, action.payload is the string value
          state.error = action.payload;
        } else if (action?.error?.message) {
          // For other errors, action.error is a SerializedError
          state.error = action.error.message;
        } else {
          state.error = "Failed to fetch layout due to an unknown error.";
        }
      });
  },
});

export const { clearLayout, setCurrentMarkdownKey } = dynamicLayoutSlice.actions;

export const selectAllLayouts = (state: RootState) => state.dynamicLayout.layouts;
export const selectLayoutDataByKey = (
  state: RootState,
  key: string,
): ApiLayoutResponse | undefined => {
  const layoutEntry = state.dynamicLayout.layouts.find((layout) => layout.key === key);
  return layoutEntry?.data;
};
export const selectLayoutEntryByKey = (state: RootState, key: string): LayoutEntry | undefined => {
  return state.dynamicLayout.layouts.find((layout) => layout.key === key);
};
export const selectIsLayoutLoading = (state: RootState) => state.dynamicLayout.isLoading;
export const selectLayoutError = (state: RootState) => state.dynamicLayout.error;
export const selectCurrentMarkdownKey = (state: RootState) =>
  state.dynamicLayout.currentMarkdownKey;

export default dynamicLayoutSlice.reducer;
