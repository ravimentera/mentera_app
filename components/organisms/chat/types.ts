export type Sender = "user" | "assistant";

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  threadId: string;
  createdAt: number;
}

export interface WebSocketResponseMessage {
  type: string;
  chunk?: any;
  error?: string;
  response?: {
    content?: string;
    metadata?: any;
  };
}
