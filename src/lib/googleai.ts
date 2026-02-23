import fetch from "node-fetch";

export async function generateFromMessages(messages: { role?: string; content?: string }[]): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not defined");

  const endpoint = process.env.GOOGLE_AI_ENDPOINT || "https://generativeai.googleapis.com/v1beta2/models/gemini-2.0-flash:generateMessage";

  // Build messages payload in a best-effort shape compatible with Google Generative API
  const payload = {
    messages: messages.map((m) => ({
      author: m.role === "assistant" ? "system" : "user",
      content: [{ type: "text", text: m.content ?? "" }],
    })),
    temperature: 0.2,
    max_output_tokens: 1000,
  } as any;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google AI error: ${res.status} ${text}`);
  }

  const json = await res.json().catch(() => null);

  // Try to extract text from common response shapes
  const candidates = json?.candidates || json?.output || json?.responses || json?.response;
  // look for nested text fields
  if (Array.isArray(candidates) && candidates.length > 0) {
    const first = candidates[0];
    // common: { content: [{type:'text', text: '...'}], output_text }
    if (first.output_text) return String(first.output_text);
    if (first.content && Array.isArray(first.content)) {
      const txt = first.content.map((c: any) => c.text || c.output_text || c["text"]).filter(Boolean).join("\n");
      if (txt) return txt;
    }
    if (first.text) return String(first.text);
  }

  // fallback to any top-level field that might contain text
  if (json?.output_text) return String(json.output_text);
  if (json?.candidates && json.candidates[0]?.message?.content) return String(json.candidates[0].message.content);

  // last resort: return raw JSON
  return JSON.stringify(json ?? "");
}

export default generateFromMessages;
