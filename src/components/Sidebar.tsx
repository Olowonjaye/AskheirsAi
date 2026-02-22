"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const [sessions, setSessions] = useState<Array<{ id: string; title?: string }>>([]);
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => setSessions(Array.isArray(data) ? (data as any[]) : []))
      .catch(() => setSessions([]));
  }, []);

  return (
    <aside className={`${collapsed ? "w-16" : "w-72"} bg-white border-r border-gray-200 h-full hidden md:flex flex-col transition-width duration-200`}>
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">AH</div>
          {!collapsed && <h3 className="text-sm font-semibold text-gray-800">Chats</h3>}
        </div>
        <div className="flex items-center gap-2">
          {!collapsed && (
            <Link href="/chat">
              <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md shadow">New</button>
            </Link>
          )}
          <button onClick={onToggle} aria-label="Toggle sidebar" className="p-1 rounded hover:bg-gray-100">
            <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M6 6h8v2H6V6zM6 12h8v2H6v-2z"/></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
        {sessions.length === 0 && (
          <div className="text-sm text-gray-500 px-3">No chats yet — start a new conversation.</div>
        )}

        {sessions.map((s) => (
          <Link key={s.id} href={`/chat/${s.id}`}>
            <div className="px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-700">{(s.title || "").charAt(0) || "N"}</div>
              {!collapsed && <div className="text-sm text-gray-800">{s.title || "New Chat"}</div>}
            </div>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm text-gray-700">U</div>
          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">Your Account</div>
              <div className="text-xs text-gray-500">View profile</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
