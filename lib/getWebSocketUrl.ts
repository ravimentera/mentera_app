// // libs/getWebSocketUrl.ts

// export function getWebSocketUrl(): string {
//   // Check if running in a development environment
//   // In Next.js, NODE_ENV is 'development' during `next dev`
//   const isDevelopment = process.env.NODE_ENV === "production";
//   // const isDevelopment = process.env.NODE_ENV === "development";

//   if (isDevelopment) {
//     // Local development: connect to your mock server
//     const localHost = process.env.NEXT_PUBLIC_WS_HOST_LOCAL || "localhost:8080";
//     // Ensure your mock server listens on the root path or adjust accordingly.
//     // The mock server provided listens on the root path (e.g., ws://localhost:8080/)
//     // return `ws://${localHost}`;
//     return "ws://0.0.0.0:5010/ws";
//   }

//   // Production or other environments: use the provided host or default
//   const productionHost = process.env.NEXT_PUBLIC_WS_HOST || "34.204.48.222";
//   // Your production WebSocket endpoint might be at a specific path like /ws
//   // return `ws://${productionHost}:5010/ws`;
//   return `wss://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/ws-proxy`;
// }

export function getWebSocketUrl(): string {
  // only run this in the browser
  if (typeof window === "undefined") {
    throw new Error("getWebSocketUrl() may only be called client-side");
  }

  const { protocol, hostname } = window.location;

  // 1️⃣ On your local machine, short-circuit and talk directly to your EC2 WS:
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    // preserve secure upgrade if you're running https locally
    const wsScheme = protocol === "https:" ? "wss" : "ws";
    return `${wsScheme}://0.0.0.0:5010/ws`;
  }

  // 2️⃣ In “production” (or any non-localhost host), go via your proxy route
  //    which *you* will spin up locally via vercel dev (see below)
  const wsScheme = protocol === "https:" ? "wss" : "ws";
  // window.location.host already gives “mentera-app.vercel.app” (or your custom domain)
  return `${wsScheme}://${window.location.host}/api/ws-proxy`;
}
