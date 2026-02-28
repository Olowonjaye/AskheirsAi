export async function generateFromMessages(messages: { role?: string; content?: string }[]): Promise<any> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not defined");

  const model = process.env.GOOGLE_AI_MODEL || "gemini-2.5-flash";
  // Prefer a user-supplied endpoint, otherwise construct the standard generateContent URL
  let endpoint = process.env.GOOGLE_AI_ENDPOINT || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  try {
    const url = new URL(endpoint);
    if (!url.searchParams.has("key")) url.searchParams.set("key", apiKey);
    endpoint = url.toString();
  } catch (e) {
    if (!endpoint.includes("key=")) endpoint = `${endpoint}${endpoint.includes("?") ? "&" : "?"}key=${encodeURIComponent(apiKey)}`;
  }

  const combined = Array.isArray(messages)
    ? messages.map((m) => `${m.role ?? "user"}: ${m.content ?? ""}`).join("\n")
    : String(messages);

  // Strict Gemini generateContent body: contents + generationConfig
  const body = {
    contents: [
      {
        parts: [{ text: combined }],
      },
    ],
    generationConfig: {
      temperature: Number(process.env.GOOGLE_AI_TEMPERATURE ?? 0.7),
      maxOutputTokens: Number(process.env.GOOGLE_AI_MAX_OUTPUT_TOKENS ?? 500),
    },
  } as any;

  if (process.env.NODE_ENV !== "production") console.debug("[googleai] endpoint", endpoint, "body", body);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch((e) => {
    throw new Error(`Google AI request failed: ${String(e)}`);
  });

  const textBody = await res.text().catch(() => "");
  if (!res.ok) {
    if (process.env.NODE_ENV !== "production") console.warn("[googleai] non-OK response", res.status, textBody);
    throw new Error(`Google AI error: ${res.status} ${textBody}`);
  }

  let json: any = null;
  try {
    json = JSON.parse(textBody || "null");
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.warn("[googleai] failed parsing json, returning text body");
    // return a minimal object wrapping the raw text so callers receive consistent type
    return { rawText: textBody };
  }

  if (process.env.NODE_ENV !== "production") console.debug("[googleai] response json:", json);

  // Return the full parsed JSON to the caller. Provider-specific parsing
  // should be performed by a dedicated helper so the API route can normalize
  // the output for the frontend.
  return json;
}

export default generateFromMessages;

// Helper: extract the assistant text from a Gemini generateContent response.
export function extractGeminiText(resp: any): string | null {
  try {
    const root = resp?.data ?? resp ?? null;
    if (!root) return null;

    // Preferred path: data.candidates[0].content.parts[0].text
    const candidates = root?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      const first = candidates[0];
      // candidate.content may be an object with parts or an array
      const content = first?.content ?? null;
      // content.parts
      if (content) {
        if (Array.isArray(content?.parts) && content.parts.length > 0 && typeof content.parts[0]?.text === "string") {
          return sanitizeText(content.parts.map((p: any) => p.text).filter(Boolean).join("\n"));
        }
        // content might be an array with elements that have parts
        if (Array.isArray(content)) {
          for (const c of content) {
            if (Array.isArray(c?.parts) && c.parts.length > 0 && typeof c.parts[0]?.text === "string") {
              return sanitizeText(c.parts.map((p: any) => p.text).filter(Boolean).join("\n"));
            }
          }
        }
      }

      // fallback to output_text or message.content
      if (typeof first.output_text === "string" && first.output_text.trim()) return sanitizeText(first.output_text);
      if (first.message?.content && typeof first.message.content === "string") return sanitizeText(first.message.content);
    }

    // older style: output[0].content[0].text
    const out = root?.output?.[0];
    if (out && Array.isArray(out?.content) && out.content.length > 0) {
      const c0 = out.content[0];
      if (typeof c0?.text === "string") return sanitizeText(c0.text);
      if (Array.isArray(c0?.parts) && c0.parts[0]?.text) return sanitizeText(c0.parts.map((p: any) => p.text).filter(Boolean).join("\n"));
    }

    // direct fields
    if (typeof root.output_text === "string" && root.output_text.trim()) return sanitizeText(root.output_text);

    return null;
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.warn("[googleai] extractGeminiText error", e);
    return null;
  }
}

function sanitizeText(s: string): string {
  if (!s || typeof s !== "string") return "";
  // remove control characters, limit length
  const cleaned = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
  const max = Number(process.env.GOOGLE_AI_MAX_FRONTEND_CHARS ?? 20000);
  return cleaned.length > max ? cleaned.slice(0, max) : cleaned;
}
