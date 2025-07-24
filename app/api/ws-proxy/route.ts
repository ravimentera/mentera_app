import { getTranscriptionWebSocketUrl } from "@/lib/getWebSocketUrl";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const token = searchParams.get("token");
  if (!token) {
    return new Response("Token required", { status: 400 });
  }

  // Use centralized WebSocket URL logic
  const wsBaseUrl = getTranscriptionWebSocketUrl();
  const wsUrl = wsBaseUrl + "/api/providers/ws/transcription?token=" + encodeURIComponent(token);

  console.log("WebSocket Proxy - Base URL:", wsBaseUrl);
  console.log("WebSocket Proxy - Final URL:", wsUrl);
  console.log("WebSocket Proxy - Environment:", process.env.NODE_ENV);

  return new Response(
    JSON.stringify({
      wsUrl,
      message: `Using ${wsBaseUrl.startsWith("wss:") ? "secure (WSS)" : "standard (WS)"} WebSocket connection`,
      protocol: wsBaseUrl.startsWith("wss:") ? "wss" : "ws",
      environment: process.env.NODE_ENV,
      baseUrl: wsBaseUrl,
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
