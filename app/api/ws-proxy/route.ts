import { NextRequest } from "next/server";

// Use environment variable consistently - this should be the single source of truth
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://34.204.48.222:5004";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const token = searchParams.get("token");
  if (!token) {
    return new Response("Token required", { status: 400 });
  }

  // Determine the correct WebSocket protocol based on request protocol
  const isSecure = url.protocol === "https:";

  // Convert HTTP to WebSocket protocol, ensuring secure connection for HTTPS requests
  let wsBaseUrl: string;
  if (isSecure) {
    // For HTTPS requests, use WSS even if API base URL is HTTP
    wsBaseUrl = API_BASE_URL.replace(/^https?:/, "wss:");
  } else {
    // For HTTP requests, use WS
    wsBaseUrl = API_BASE_URL.replace(/^https?:/, "ws:");
  }

  const wsUrl = wsBaseUrl + "/api/providers/ws/transcription?token=" + encodeURIComponent(token);

  console.log("WebSocket Proxy - Environment:", API_BASE_URL);
  console.log("WebSocket Proxy - Protocol:", isSecure ? "HTTPS (WSS)" : "HTTP (WS)");
  console.log("WebSocket Proxy - Final URL:", wsUrl);

  return new Response(
    JSON.stringify({
      wsUrl,
      message: `Using ${isSecure ? "secure (WSS)" : "standard (WS)"} WebSocket connection`,
      protocol: isSecure ? "wss" : "ws",
      sourceUrl: API_BASE_URL,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  );
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
