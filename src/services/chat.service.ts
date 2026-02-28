import clientPromise from "@/lib/db";
import { generateFromMessages, extractGeminiText } from "@/lib/googleai";

type ProcessChatOpts = {
  userId?: string | null;
  sessionId?: string | null;
};

export async function processChat(message: string, opts: ProcessChatOpts = {}, assistantText?: string) {
  // If caller supplied extracted assistantText, use it. Otherwise derive via provider call.
  let answer = assistantText ?? null;
  if (!answer) {
    const raw = await generateFromMessages([{ role: "user", content: message }]);
    answer = extractGeminiText(raw) ?? String(raw?.text ?? raw?.output_text ?? "");
  }

  const client = await clientPromise;
  const db = client.db("askheirs");

  await db.collection("chats").insertOne({
    message,
    answer,
    userId: opts.userId ?? null,
    sessionId: opts.sessionId ?? null,
    createdAt: new Date(),
  });

  return answer;
}

export default processChat;
