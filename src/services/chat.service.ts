import clientPromise from "@/lib/db";
import { generateFromMessages } from "@/lib/googleai";

type ProcessChatOpts = {
  userId?: string | null;
  sessionId?: string | null;
};

export async function processChat(message: string, opts: ProcessChatOpts = {}) {
  const answer = await generateFromMessages([{ role: "user", content: message }]);

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
