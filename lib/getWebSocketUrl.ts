// libs/getWebSocketUrl.ts

export function getWebSocketUrl(): string {
  const host = process.env.NEXT_PUBLIC_WS_HOST || "localhost";
  const port = process.env.NEXT_PUBLIC_WS_PORT || "5003";
  return `ws://${host}:${port}/ws`;
}
