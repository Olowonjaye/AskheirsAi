"use client";

import { useEffect, useRef, useState } from "react";
import { streamChat, Message } from "@/lib/ai-client";

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 🔹 Load messages from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("askheirai-chat");
    if (stored) setMessages(JSON.parse(stored));
  }, []);

  // 🔹 Persist messages
  useEffect(() => {
    localStorage.setItem("askheirai-chat", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    let assistantMessage: Message = {
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    await streamChat(updatedMessages, (chunk) => {
      assistantMessage.content += chunk;

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          ...assistantMessage,
        };
        return newMessages;
      });
    });

    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#343541] text-white">
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-3 rounded-lg text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#19c37d] text-black"
                  : "bg-[#444654]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4 bg-[#40414f]">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            className="flex-1 bg-[#343541] border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming}
            className="bg-[#19c37d] px-4 py-2 rounded-md text-black font-medium disabled:opacity-50"
          >
            {isStreaming ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
