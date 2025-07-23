import { NextRequest } from "next/server";

const WS_BASE_URL = process.env.API_BASE_URL || "http://34.204.48.222:5004";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Get the token from query params
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Token required", { status: 400 });
  }

  // Create WebSocket URL
  const wsUrl =
    WS_BASE_URL.replace(/^http/, "ws") + "/api/providers/ws/transcription?token=" + token;

  console.log("WebSocket Proxy - Redirecting to:", wsUrl);

  // For WebSocket connections, we need to upgrade the connection
  // This is a simplified approach - you might need a more sophisticated proxy
  return new Response(
    JSON.stringify({
      wsUrl,
      message: "Use this URL for WebSocket connection",
      note: "Direct WebSocket proxy not supported in Edge Runtime. Use returned URL directly.",
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
