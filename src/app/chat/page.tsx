import ChatBox from "@/components/ChatBox";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  if (!session) return redirect("/login");

  return (
    <main className="flex justify-center py-12 bg-gray-50 min-h-screen">
      <ChatBox />
    </main>
  );
}
