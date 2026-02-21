import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("askheirs");

    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const res = await db.collection("users").insertOne({
      name: name || null,
      email,
      password: hashed,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: res.insertedId?.toString?.() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
