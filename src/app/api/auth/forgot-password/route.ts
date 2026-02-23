import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("askheirs");

    const user = await db.collection("users").findOne({ email });

    // Always respond 200 to avoid email enumeration
    if (!user) {
      console.log("Password reset requested for non-existing email", email);
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const tokenHash = await bcrypt.hash(token, 10);
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.collection("users").updateOne({ email }, { $set: { resetTokenHash: tokenHash, resetTokenExpiry: expiry } });

    const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetLink = `${base.replace(/\/$/, "")}/reset-password/${token}`;

    // TODO: Send email via SMTP / provider. For now, log link so developer can use it.
    console.log(`Password reset link for ${email}: ${resetLink}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate reset link" }, { status: 500 });
  }
}
