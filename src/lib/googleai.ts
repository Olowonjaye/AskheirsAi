export async function generateFromMessages(messages: { role?: string; content?: string }[]): Promise<{ raw: any; text: string | null }> {
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

  // Strict Gemini generateContent body: include the system formatting prompt
  // as the first content item (provider-safe) followed by the user prompt.
  const body = {
    contents: [
      // System-level formatting guidance (seen by model first)
      { parts: [{ text: SYSTEM_FORMATTING_PROMPT }] },
      // User message
      { parts: [{ text: combined }] },
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
    return { raw: textBody, text: null };
  }

  if (process.env.NODE_ENV !== "production") console.debug("[googleai] response json:", json);

  // Try to extract text now so callers receive both raw and sanitized text.
  const extracted = extractGeminiText(json);
  if (process.env.NODE_ENV !== "production") console.debug("[googleai] extracted text:", extracted);

  return { raw: json, text: extracted };
}

export default generateFromMessages;

// System-level formatting prompt applied to every Gemini request.
export const SYSTEM_FORMATTING_PROMPT = `
You are an assistant that must respond in clean, renderable Markdown only. Follow these rules exactly:
- Output must be valid Markdown, not HTML or JSON. Never include raw JSON, metadata, tokens, or provider fields in the response.
- Keep paragraphs short (no more than 2-4 lines). Use blank lines between paragraphs.
- Use proper capitalization and grammar.
- Use headings (### or ####) when introducing sections; keep heading levels consistent.
- Use bold for key concepts and short phrases to emphasize ideas.
- Use bullet lists for enumerations; avoid inline numbered sentences.
- Avoid long, unbroken text blocks; prefer several short paragraphs or bullet lists.
- Avoid emojis and excessive punctuation.
- End with a short, engaging follow-up question when appropriate (one sentence).
- Keep a professional but conversational tone.

Ensure the output can be rendered cleanly by a Markdown renderer (e.g., react-markdown). Do not return any provider JSON, usage, modelVersion, or other metadata in the response body; only user-facing Markdown content is allowed.
`;

// Helper: extract the assistant text from a Gemini generateContent response.
export function extractGeminiText(resp: any): string | null {
  try {
    const root = resp?.data ?? resp ?? null;
    if (!root) return null;

    // Preferred explicit path: data.candidates[0].content.parts[0].text
    const candidates = root?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      const first = candidates[0];
      // If content is an object with parts
      if (first?.content?.parts && Array.isArray(first.content.parts) && first.content.parts.length > 0) {
        const txt = first.content.parts.map((p: any) => p?.text).filter(Boolean).join("\n");
        if (txt) return sanitizeText(txt);
      }
      // If content is an array with objects that have parts
      if (Array.isArray(first?.content)) {
        for (const c of first.content) {
          if (c?.parts && Array.isArray(c.parts) && c.parts.length > 0) {
            const txt = c.parts.map((p: any) => p?.text).filter(Boolean).join("\n");
            if (txt) return sanitizeText(txt);
          }
          // sometimes content elements have text directly
          if (typeof c?.text === "string" && c.text.trim()) return sanitizeText(c.text);
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

    // Last-resort: recursively search for the largest text-like field in the object
    const found = findBestTextRecursive(root);
    return found ? sanitizeText(found) : null;
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

function findBestTextRecursive(obj: any): string | null {
  const seen = new Set<any>();
  let best: string | null = null;

  function walk(node: any) {
    if (!node || typeof node !== "object") return;
    if (seen.has(node)) return;
    seen.add(node);

    for (const k of Object.keys(node)) {
      const v = node[k];
      if (typeof v === "string" && v.trim()) {
        if (!best || v.length > best.length) best = v;
      } else if (Array.isArray(v)) {
        for (const el of v) {
          if (typeof el === "string" && el.trim()) {
            if (!best || el.length > best.length) best = el;
          } else if (typeof el === "object") walk(el);
        }
      } else if (typeof v === "object") {
        walk(v);
      }
    }
  }

  walk(obj);
  return best;
}
