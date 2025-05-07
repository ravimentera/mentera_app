// libs/getWebSocketUrl.ts
export function getWebSocketUrl(): string {
  const host = process.env.NEXT_PUBLIC_WS_HOST || "api.mentera.ai";
  return `wss://${host}/ws`;
}
