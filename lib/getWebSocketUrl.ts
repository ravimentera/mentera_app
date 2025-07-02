// libs/getWebSocketUrl.ts

export function getWebSocketUrl(): string {
  // Check if running in a development environment
  // In Next.js, NODE_ENV is 'development' during `next dev`
  // const isDevelopment = process.env.NODE_ENV === "production";
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    // Local development: connect to your mock server
    const localHost = process.env.NEXT_PUBLIC_WS_HOST_LOCAL || "localhost:8080";
    // Ensure your mock server listens on the root path or adjust accordingly.
    // The mock server provided listens on the root path (e.g., ws://localhost:8080/)
    // return `ws://${localHost}`;
    return "ws://0.0.0.0:5010/ws";
  }

  // Production or other environments: use the provided host or default
  const productionHost = process.env.NEXT_PUBLIC_WS_HOST || "34.204.48.222";
  // Your production WebSocket endpoint might be at a specific path like /ws
  return `ws://${productionHost}:5010/ws`;
}
