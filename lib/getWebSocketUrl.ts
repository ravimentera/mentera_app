export function getWebSocketUrl(): string {
  const host = process.env.NEXT_PUBLIC_WS_HOST || "54.211.215.119";
  // Use secure WebSockets when the page is on HTTPS, regular WebSockets otherwise
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // When using wss://, Nginx will handle the connection on port 443
  const portSuffix = protocol === 'ws:' ? `:${process.env.NEXT_PUBLIC_WS_PORT || "5010"}` : '';
  return `${protocol}//${host}${portSuffix}/ws`;
}
