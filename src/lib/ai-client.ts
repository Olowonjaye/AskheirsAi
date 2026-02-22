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
    body: JSON.stringify({ messages }),
  });

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    onChunk(chunk);
  }
}
