import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db("askheirs");

  const usersCount = await db.collection("users").countDocuments();
  const chatsCount = await db.collection("chats").countDocuments();

  const recentChats = await db.collection("chats").find().sort({ createdAt: -1 }).limit(10).toArray();

  return NextResponse.json({ usersCount, chatsCount, recentChats });
}
