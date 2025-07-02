export type Sender = "user" | "assistant";

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  threadId: string;
  createdAt: number;
}
interface AuthSuccess {
  type: "auth_success";
}
interface ChatStreamStart {
  type: "chat_stream_start";
}
interface ChatStreamChunk {
  type: "chat_stream_chunk";
  chunk: any;
}
interface ChatStreamComplete {
  type: "chat_stream_complete";
  response: { content?: string; metadata?: any };
}
interface ChatStreamError {
  type: "chat_stream_error";
  error: string;
}

interface DocUploadProgress {
  type: "DOCUMENT_UPLOAD_PROGRESS";
  payload: any;
}
interface DocValidationError {
  type: "DOCUMENT_VALIDATION_ERROR";
  payload: any;
}
interface DocAnalysisChunk {
  type: "DOCUMENT_ANALYSIS_CHUNK";
  payload: any;
}
interface DocUploadResponse {
  type: "DOCUMENT_UPLOAD_RESPONSE";
  payload: any;
}

interface CacheControlResponse {
  type: "cache_control_response";
  payload: any;
}
interface GenericError {
  type: "error";
  error: string;
}
interface AuthError {
  type: "auth_error";
  error: string;
}

export type WebSocketResponseMessage =
  | AuthSuccess
  | ChatStreamStart
  | ChatStreamChunk
  | ChatStreamComplete
  | ChatStreamError
  | DocUploadProgress
  | DocValidationError
  | DocAnalysisChunk
  | DocUploadResponse
  | CacheControlResponse
  | GenericError
  | AuthError;
