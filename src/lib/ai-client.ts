export type Role = "user" | "assistant";

export interface Message {
  id?: string;
  role: Role;
  content: string;
  timestamp?: number;
  attachments?: { type: string; name?: string; dataUrl?: string; url?: string }[];
}

export async function streamChat(
  messages: Message[],
  onChunk: (chunk: string) => void
) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // include cookies so NextAuth JWT/session is sent with the request
    credentials: "include",
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(txt || `Request failed with status ${response.status}`);
  }
  // If server responded with JSON (non-streaming), call onChunk once with the reply.
  const contentType = response.headers.get("content-type") || "";
  if (!response.body || contentType.includes("application/json")) {
    const json = await response.json().catch(() => null);
    if (!json) return;
    // New normalized shape: { success: true, data: { role, content } }
    if (json?.success === true && json?.data && typeof json.data.content === "string") {
      onChunk(json.data.content);
      return;
    }
    // Error shape: { success: false, error: '...' }
    if (json?.success === false) {
      throw new Error(String(json?.error ?? "Request failed"));
    }
    // Backwards compatibility: legacy reply field
    if (typeof json?.reply === "string") {
      onChunk(json.reply);
      return;
    }
    // Fallback: if the JSON is a string or contains a top-level text, stringify safely
    if (typeof json === "string") {
      onChunk(json);
      return;
    }
    // Nothing usable found
    throw new Error("Unexpected API response shape");
    return;
  }

  // Otherwise treat as a streaming response and read chunks from the body.
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    onChunk(chunk);
  }
}
