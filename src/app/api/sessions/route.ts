import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  const user = await (prisma as any).user.findUnique({ where: { email: session.user.email } });

  const sessions = await (prisma as any).chatSession.findMany({
    where: { userId: user?.id ?? undefined },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(sessions || []);
}
