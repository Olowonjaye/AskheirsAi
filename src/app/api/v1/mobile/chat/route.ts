import { NextResponse } from "next/server";
import { ratelimit } from "@/lib/rate-limit";
import processChat from "@/services/chat.service";

export async function POST(req: Request) {
  const { message, sessionId } = await req.json();
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const { success } = await ratelimit.limit(ip);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const answer = await processChat(message, { userId: null, sessionId: sessionId ?? null });
  return NextResponse.json({ answer });
}
