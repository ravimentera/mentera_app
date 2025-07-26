// store/messagesSlice.ts (Updated from your existing code)
import { PayloadAction as ReduxPayloadAction, createSlice } from "@reduxjs/toolkit"; // Renamed to avoid conflict

// Your existing Sender type
type Sender = "user" | "assistant";

// Update Message interface to include threadId, createdAt, and optional context
export interface Message {
  id: string;
  threadId: string; // Added to associate message with a thread
  sender: Sender;
  text: string;
  createdAt: number; // Added for sorting or display
  context?: any; // Optional patient context for Bedrock agent
  shouldSend?: boolean; // Flag to indicate if this message should be sent to backend
  isSent?: boolean; // Flag to track if message was already sent
}

interface MessagesState {
  items: Message[];
}

const initialMessagesState: MessagesState = {
  items: [],
};

export const messagesSlice = createSlice({
  name: "messages",
  initialState: initialMessagesState,
  reducers: {
    // addMessage now expects a full Message object, including threadId and createdAt
    addMessage(state, action: ReduxPayloadAction<Message>) {
      console.log("Message Slice:", { data: action.payload });

      state.items.push(action.payload);
    },
    updateMessage(
      state,
      action: ReduxPayloadAction<{ id: string; text?: string; context?: any; isSent?: boolean }>,
    ) {
      const index = state.items.findIndex((msg) => msg.id === action.payload.id);
      if (index !== -1) {
        if (action.payload.text !== undefined) {
          state.items[index].text = action.payload.text;
        }
        if (action.payload.context !== undefined) {
          state.items[index].context = action.payload.context;
        }
        if (action.payload.isSent !== undefined) {
          state.items[index].isSent = action.payload.isSent;
        }
      }
    },
    deleteMessage(state, action: ReduxPayloadAction<string>) {
      state.items = state.items.filter((msg) => msg.id !== action.payload);
    },
    // New reducer to delete all messages for a specific thread
    deleteMessagesForThread(state, action: ReduxPayloadAction<string>) {
      state.items = state.items.filter((msg) => msg.threadId !== action.payload);
    },
    // Optional: Load messages if you persist them
    loadMessages: (state, action: ReduxPayloadAction<Message[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addMessage, updateMessage, deleteMessage, deleteMessagesForThread, loadMessages } =
  messagesSlice.actions;

export default messagesSlice.reducer;
