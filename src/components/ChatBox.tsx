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
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Helpers to safely access media APIs (some browsers or contexts may not expose them)
  const supportsUserMedia = () => typeof navigator !== "undefined" && !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function");
  const supportsDisplayMedia = () => {
    if (typeof navigator === "undefined") return false;
    if (navigator.mediaDevices && (navigator.mediaDevices as any).getDisplayMedia) return true;
    return typeof (navigator as any).getDisplayMedia === "function";
  };

  const getDisplayMediaFn = (): ((constraints: MediaStreamConstraints) => Promise<MediaStream>) | null => {
    if (typeof navigator === "undefined") return null;
    if (navigator.mediaDevices && (navigator.mediaDevices as any).getDisplayMedia) return (navigator.mediaDevices as any).getDisplayMedia.bind(navigator.mediaDevices);
    if (typeof (navigator as any).getDisplayMedia === "function") return (navigator as any).getDisplayMedia.bind(navigator);
    return null;
  };

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
      // Defensive: if the chunk looks like the full JSON response, parse and extract content
      let text = chunk;
      try {
        if (typeof chunk === "string" && chunk.trim().startsWith("{")) {
          const parsed = JSON.parse(chunk);
          if (parsed?.success === true && parsed?.data?.content) {
            text = String(parsed.data.content);
          } else if (typeof parsed?.reply === "string") {
            text = parsed.reply;
          }
        }
      } catch (e) {
        // ignore parse errors and treat as plain text
      }

      assistantMessage.content += text;
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { ...assistantMessage };
        return newMessages;
      });
    });

    setIsStreaming(false);
  };

  const processUserMessage = async (updatedMessages: Message[]) => {
    // If the latest user message has attachments with dataUrl, upload them first
    const last = updatedMessages[updatedMessages.length - 1];
    if (last?.attachments && last.attachments.some((a) => a.dataUrl && !a.url)) {
      try {
        const toUpload = last.attachments.filter((a) => a.dataUrl).map((a) => ({ type: a.type, name: a.name, dataUrl: a.dataUrl! }));
        const res = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attachments: toUpload }),
        });
        const json = await res.json();
        if (res.ok && json.uploads) {
          const uploads: { url: string; name?: string; type?: string }[] = json.uploads;
          // replace attachments in last message
          last.attachments = uploads.map((u) => ({ type: u.type || "application/octet-stream", name: u.name, url: u.url }));
        }
      } catch (err) {
        console.error("upload failed", err);
      }
    }

    // reuse streaming logic to get assistant reply
    setMessages(updatedMessages);
    setIsStreaming(true);

    let assistantMessage: Message = { id: String(Date.now() + 1), role: "assistant", content: "", timestamp: Date.now() };
    setMessages((prev) => [...prev, assistantMessage]);

    await streamChat(updatedMessages, (chunk) => {
      // Defensive parsing like in sendMessage
      let text = chunk;
      try {
        if (typeof chunk === "string" && chunk.trim().startsWith("{")) {
          const parsed = JSON.parse(chunk);
          if (parsed?.success === true && parsed?.data?.content) {
            text = String(parsed.data.content);
          } else if (typeof parsed?.reply === "string") {
            text = parsed.reply;
          }
        }
      } catch (e) {
        // ignore parse errors
      }

      assistantMessage.content += text;
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { ...assistantMessage };
        return newMessages;
      });
    });

    setIsStreaming(false);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        const userMessage: Message = {
          id: String(Date.now()),
          role: "user",
          content: file.type.startsWith("image/") ? "Sent an image" : `Sent a file: ${file.name}`,
          timestamp: Date.now(),
          attachments: [{ type: file.type, name: file.name, dataUrl }],
        };
        processUserMessage([...messages, userMessage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const startRecording = async () => {
    try {
      if (!supportsUserMedia()) {
        console.error("getUserMedia is not supported in this environment");
        alert("Microphone not available: your browser or context does not support getUserMedia. Try HTTPS or a modern browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result || "");
          const userMessage: Message = {
            id: String(Date.now()),
            role: "user",
            content: "Sent a voice message",
            timestamp: Date.now(),
            attachments: [{ type: "audio/webm", name: "voice.webm", dataUrl }],
          };
          processUserMessage([...messages, userMessage]);
        };
        reader.readAsDataURL(blob);
        // stop all tracks
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error("microphone error", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const openCamera = async () => {
    try {
      if (!supportsUserMedia()) {
        console.error("getUserMedia is not supported in this environment");
        alert("Camera not available: your browser or context does not support getUserMedia. Try HTTPS or a modern browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setShowCamera(true);
    } catch (err) {
      console.error("camera error", err);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    // stop camera tracks
    const stream = video.srcObject as MediaStream | null;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setShowCamera(false);

    const userMessage: Message = {
      id: String(Date.now()),
      role: "user",
      content: "Captured a photo",
      timestamp: Date.now(),
      attachments: [{ type: "image/png", name: "photo.png", dataUrl }],
    };
    processUserMessage([...messages, userMessage]);
  };

  const captureScreen = async () => {
    try {
      // ask for screen capture
      const displayFn = getDisplayMediaFn();
      if (!displayFn) {
        console.error("getDisplayMedia is not supported in this environment");
        alert("Screen capture not available: your browser or context does not support getDisplayMedia. Try a modern browser or HTTPS.");
        return;
      }
      const stream = await displayFn({ video: true });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track as any);
      const bitmap = await (imageCapture as any).grabFrame();
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(bitmap, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      track.stop();

      const userMessage: Message = {
        id: String(Date.now()),
        role: "user",
        content: "Captured a screenshot",
        timestamp: Date.now(),
        attachments: [{ type: "image/png", name: "screenshot.png", dataUrl }],
      };
      processUserMessage([...messages, userMessage]);
    } catch (err) {
      console.error("screenshot error", err);
    }
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

                    {/* attachments preview */}
                    {msg.attachments?.map((att, idx) => (
                      <div key={idx} className="mt-2">
                        {att.url || att.dataUrl ? (
                          att.type?.startsWith("image/") ? (
                            <img
                              src={att.url || att.dataUrl!}
                              alt={att.name || "image"}
                              width={320}
                              height={200}
                              className="rounded-md cursor-pointer object-cover"
                              style={{ maxWidth: 320, maxHeight: 200 }}
                              onClick={() => setLightboxSrc(att.url || att.dataUrl!)}
                            />
                          ) : att.type?.startsWith("audio/") ? (
                            <audio controls src={att.url || att.dataUrl!} className="w-full mt-2" />
                          ) : (
                            <a href={att.url || att.dataUrl!} download={att.name} className="text-sm text-blue-600 underline">
                              {att.name || "Download file"}
                            </a>
                          )
                        ) : null}
                      </div>
                    ))}
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
            <div className="flex items-center gap-2">
              <input id="file-input" type="file" className="hidden" multiple onChange={(e) => handleFiles(e.target.files)} />
              <label htmlFor="file-input" className="p-2 rounded hover:bg-gray-100 cursor-pointer" title="Upload file">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 5 17 10"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
              </label>

              <button onClick={() => (isRecording ? stopRecording() : startRecording())} className={`p-2 rounded ${isRecording ? 'bg-red-100' : 'hover:bg-gray-100'}`} title="Record voice">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1v11"/><path d="M19 11a7 7 0 0 1-14 0"/></svg>
              </button>

              <button onClick={openCamera} className="p-2 rounded hover:bg-gray-100" title="Take photo">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="7" width="18" height="14" rx="2"/><circle cx="12" cy="14" r="3"/><path d="M8 7l1-2h6l1 2"/></svg>
              </button>

              <button onClick={captureScreen} className="p-2 rounded hover:bg-gray-100" title="Capture screen">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 20h8"/></svg>
              </button>
            </div>

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

      {/* Camera modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-4">
            <video ref={videoRef} autoPlay className="w-[480px] h-[360px] bg-black" />
            <div className="mt-2 flex gap-2 justify-end">
              <button onClick={() => { const stream = videoRef.current?.srcObject as MediaStream | null; if (stream) stream.getTracks().forEach(t=>t.stop()); setShowCamera(false); }} className="px-3 py-1">Cancel</button>
              <button onClick={capturePhoto} className="px-3 py-1 bg-blue-600 text-white rounded-md">Capture</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for image preview */}
      {lightboxSrc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setLightboxSrc(null)}>
          <img src={lightboxSrc} alt="preview" className="max-w-[90%] max-h-[90%] rounded-md shadow-lg" />
        </div>
      )}
    </div>
  );
}
