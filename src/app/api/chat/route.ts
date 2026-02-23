import { generateFromMessages } from "@/lib/googleai";
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

  // Call Google AI and stream the resulting full text in chunks to the client.
  const text = await generateFromMessages(messages);
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    start(controller) {
      try {
        // chunk size chosen to provide responsive front-end streaming
        const chunkSize = 1024;
        for (let i = 0; i < text.length; i += chunkSize) {
          const part = text.slice(i, i + chunkSize);
          controller.enqueue(encoder.encode(part));
        }
      } catch (e) {
        controller.error(e as any);
        return;
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
