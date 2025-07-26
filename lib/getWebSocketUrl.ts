// libs/getWebSocketUrl.ts

export function getWebSocketUrl(endpoint?: string): string {
  // Check if running in a development environment
  // In Next.js, NODE_ENV is 'development' during `next dev`
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    // Local development: connect to your mock server
    const localHost = process.env.NEXT_PUBLIC_WS_HOST_LOCAL || "localhost:8080";
    // Ensure your mock server listens on the root path or adjust accordingly.
    // The mock server provided listens on the root path (e.g., ws://localhost:8080/)
    // return `ws://${localHost}`;
    return "ws://0.0.0.0:5010/ws";
  }

  return "wss://ws.mentera.ai/ws/";
}

// New function for transcription WebSocket URLs
export function getTranscriptionWebSocketUrl(): string {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    // For development, use the same API base URL as HTTP calls
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "wss://ws.mentera.ai/transcription";
    return apiBaseUrl.replace(/^https?:/, "ws:");
  }

  // For production, use secure WebSocket
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "wss://ws.mentera.ai/transcription";
  return apiBaseUrl.replace(/^https?:/, "wss:");
}
