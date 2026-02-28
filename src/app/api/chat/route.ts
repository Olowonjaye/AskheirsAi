import { generateFromMessages } from "@/lib/googleai";
import { ratelimit } from "@/lib/rate-limit";
import { getToken } from "next-auth/jwt";
import processChat from "@/services/chat.service";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Basic input validation / abuse protection
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid request" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    if (messages.length > 50) {
      return new Response(JSON.stringify({ success: false, error: "Too many messages" }), { status: 413, headers: { "Content-Type": "application/json" } });
    }
    // ensure each message is small enough
    const combinedLength = messages.reduce((acc: number, m: any) => acc + String(m?.content ?? "").length, 0);
    if (combinedLength > 100_000) {
      return new Response(JSON.stringify({ success: false, error: "Payload too large" }), { status: 413, headers: { "Content-Type": "application/json" } });
    }

    // Identify caller for rate-limiting (JWT token id or IP fallback)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const key = String(token?.id ?? req.headers.get("x-forwarded-for") ?? "anonymous");
  const { success } = await ratelimit.limit(key as string);
  if (!success) return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 });
    // Call Google AI and get raw provider response
    const raw = await generateFromMessages(messages);

    // Extract normalized assistant text
    const { extractGeminiText } = await import("@/lib/googleai");
    const text = extractGeminiText(raw) ?? null;

    if (!text) {
      console.error("/api/chat: unable to extract text from provider response", { raw });
      return new Response(JSON.stringify({ success: false, error: "Unable to generate response" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    // persist final conversation to user memory (best-effort, async)
    (async () => {
      try {
        const userId = typeof token?.id === "string" ? (token.id as string) : null;
        const textForStorage = Array.isArray(messages)
          ? messages.map((m: { content?: string }) => m.content ?? "").join("\n")
          : JSON.stringify(messages);
        await processChat(textForStorage, { userId, sessionId: null }, text);
      } catch (e: unknown) {
        console.error("persist chat failed", e);
      }
    })();

    return new Response(JSON.stringify({ success: true, data: { role: "assistant", content: String(text) } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("/api/chat error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
