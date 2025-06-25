import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { GlobalState } from "../types";

// Define the initial state
const initialState: GlobalState = {
  isSidePanelExpanded: false,
  streamingUISessionId: crypto.randomUUID(),
};

// Create the slice
export const globalStateSlice = createSlice({
  name: "globalState",
  initialState,
  reducers: {
    /**
     * Sets the expanded state of the side panel.
     * @param action.payload - Boolean indicating whether the panel should be expanded.
     */
    setSidePanelExpanded: (state, action: PayloadAction<boolean>) => {
      state.isSidePanelExpanded = action.payload;
    },
    /**
     * Toggles the expanded state of the side panel.
     */
    toggleSidePanel: (state) => {
      state.isSidePanelExpanded = !state.isSidePanelExpanded;
    },
  },
});

// Export actions - these will be dispatched from your components or other thunks
export const { setSidePanelExpanded, toggleSidePanel } = globalStateSlice.actions;

// Export selectors to access the state
export const selectIsSidePanelExpanded = (state: RootState) =>
  state.globalState.isSidePanelExpanded;
export const getStreamingUISessionId = (state: RootState) => state.globalState.streamingUISessionId;

// Export the reducer - this will be added to your Redux store
export default globalStateSlice.reducer;
