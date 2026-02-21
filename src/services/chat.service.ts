import clientPromise from "@/lib/db";
import { getOpenAI } from "@/lib/openai";

type ProcessChatOpts = {
  userId?: string | null;
  sessionId?: string | null;
};

export async function processChat(message: string, opts: ProcessChatOpts = {}) {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: message }],
  });

  const answer =
    completion.choices[0]?.message?.content || "No response generated.";

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
