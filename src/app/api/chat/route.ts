import { getOpenAI } from "@/lib/openai";
import { ratelimit } from "@/lib/rate-limit";
import { getToken } from "next-auth/jwt";
import processChat from "@/services/chat.service";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // Identify caller for rate-limiting (JWT token id or IP fallback)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const key = String(token?.id ?? req.headers.get("x-forwarded-for") ?? "anonymous");
  const { success } = await ratelimit.limit(key as string);
  if (!success) return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 });

  const openai = getOpenAI();
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    stream: true,
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) controller.enqueue(encoder.encode(content));
      }
      controller.close();
    },
  });

  // persist final conversation to user memory (best-effort, async)
  (async () => {
    try {
      const userId = typeof token?.id === "string" ? (token.id as string) : null;
      const text = Array.isArray(messages)
        ? messages.map((m: { content?: string }) => m.content ?? "").join("\n")
        : JSON.stringify(messages);
      await processChat(text, { userId, sessionId: null });
    } catch (e: unknown) {
      console.error("persist chat failed", e);
    }
  })();

  return new Response(readableStream);
}
