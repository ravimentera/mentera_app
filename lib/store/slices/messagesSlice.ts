import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type Sender = "user" | "ai";

interface Message {
  id: string;
  sender: Sender;
  text: string;
}

interface MessagesState {
  items: Message[];
}

const initialState: MessagesState = {
  items: [],
};

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<Message>) {
      state.items.push(action.payload);
    },
    updateMessage(state, action: PayloadAction<{ id: string; text: string }>) {
      const index = state.items.findIndex((msg) => msg.id === action.payload.id);
      if (index !== -1) {
        state.items[index].text = action.payload.text;
      }
    },
    deleteMessage(state, action: PayloadAction<string>) {
      state.items = state.items.filter((msg) => msg.id !== action.payload);
    },
  },
});

export const { addMessage, updateMessage, deleteMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
