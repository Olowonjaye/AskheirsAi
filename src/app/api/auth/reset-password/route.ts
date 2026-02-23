import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: "Missing token or password" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("askheirs");

    const now = new Date();
    const candidates = await db.collection("users").find({ resetTokenExpiry: { $gt: now } }).toArray();

    for (const u of candidates) {
      if (!u.resetTokenHash) continue;
      const ok = await bcrypt.compare(token, u.resetTokenHash);
      if (!ok) continue;

      const hashed = await bcrypt.hash(password, 10);
      await db.collection("users").updateOne({ _id: u._id }, { $set: { password: hashed }, $unset: { resetTokenHash: "", resetTokenExpiry: "" } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
