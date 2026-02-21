"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [sessions, setSessions] = useState<Array<{ id: string; title?: string }>>([]);

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => res.ok ? res.json() : [])
      .then((data: unknown) => setSessions(Array.isArray(data) ? data as any[] : []))
      .catch(() => setSessions([]));
  }, []);

  return (
    <div className="w-64 bg-[#202123] text-white p-4">
      <h2 className="mb-4 font-bold">Chats</h2>
      {sessions.map((s) => (
        <Link key={s.id} href={`/chat/${s.id}`}>
          <div className="p-2 hover:bg-gray-700 rounded cursor-pointer">
            {s.title || "New Chat"}
          </div>
        </Link>
      ))}
    </div>
  );
}
