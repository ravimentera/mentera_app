export type Sender = "user" | "ai";

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
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
