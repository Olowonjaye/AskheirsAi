"use client";

import { useEffect, useRef, useState } from "react";
import { streamChat, Message } from "@/lib/ai-client";
import Sidebar from "./Sidebar";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function ChatBox() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("askheirai-chat");
    if (stored) setMessages(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("askheirai-chat", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { id: String(Date.now()), role: "user", content: input, timestamp: Date.now() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    let assistantMessage: Message = { id: String(Date.now() + 1), role: "assistant", content: "", timestamp: Date.now() };
    setMessages((prev) => [...prev, assistantMessage]);

    await streamChat(updatedMessages, (chunk) => {
      assistantMessage.content += chunk;
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { ...assistantMessage };
        return newMessages;
      });
    });

    setIsStreaming(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((s) => !s)} />

      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">AskHeirs Assistant</h2>
            <p className="text-sm text-gray-500">Get instant answers about your insurance policies</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm px-3 py-1 border rounded-md">New chat</button>
            <button className="text-sm px-3 py-1 bg-gray-100 rounded-md">Export</button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id ?? msg.timestamp} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="mr-3 mt-1 hidden sm:flex">
                    <Image src="/images/i.png" alt="Assistant" width={36} height={36} className="rounded-full" />
                  </div>
                )}

                <div>
                  <div
                    className={`rounded-lg px-4 py-3 text-sm leading-relaxed shadow ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white max-w-[70%]"
                        : "bg-white text-gray-800 max-w-[70%] border border-gray-100"
                    }`}
                  >
                    {msg.content}
                  </div>

                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="ml-3 mt-1 hidden sm:flex">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">{(session?.user?.name || session?.user?.email || "You").toString().charAt(0).toUpperCase()}</div>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 bg-white border-t">
          <div className="max-w-3xl mx-auto flex gap-3 items-center">
            <input
              className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none"
              placeholder="Send a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={isStreaming}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {isStreaming ? (
                <span className="inline-flex gap-1"><span className="dot animate-pulse">.</span><span className="dot animate-pulse delay-75">.</span><span className="dot animate-pulse delay-150">.</span></span>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
