// libs/getWebSocketUrl.ts

export function getWebSocketUrl(): string {
  const host = process.env.NEXT_PUBLIC_WS_HOST || "54.211.215.119";
  const port = process.env.NEXT_PUBLIC_WS_PORT || "5010";
  return `ws://${host}:${port}/ws`;
}
