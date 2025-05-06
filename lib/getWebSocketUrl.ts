// libs/getWebSocketUrl.ts
export function getWebSocketUrl(): string {
  const host = process.env.NEXT_PUBLIC_WS_HOST || "54.211.215.119";
  // Always use WSS on port 443 (standard HTTPS port)
  return `wss://${host}/ws`;
}
