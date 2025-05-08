export function extractChunk(chunk: any): string {
  if (!chunk) return "";
  if (typeof chunk === "string") return chunk;
  if (typeof chunk.content === "string") return chunk.content;
  if (typeof chunk.text === "string") return chunk.text;
  if (chunk.content?.chunk?.text) return chunk.content.chunk.text;
  return "";
}

export function logMetadata(meta: any) {
  if (!meta) return;
  console.log("Model:", meta.model || "unknown");
  console.log("Processing Time:", meta.processingTime, "ms");
  if (meta.cache) {
    console.log("Cache Hit:", meta.cache.hit ? "YES" : "NO");
    if (meta.cache.ttl) console.log("TTL:", meta.cache.ttl);
  }
  if (meta.contextIntegration) {
    console.log("Context Integration:", meta.contextIntegration.score, "%");
  }
}
