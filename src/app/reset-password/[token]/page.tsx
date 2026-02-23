"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = (params as any)?.token;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) return setError("Passwords do not match");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json();
      if (!res.ok) return setError(body?.error || "Reset failed");
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError((err as Error)?.message ?? "Reset failed");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Choose a new password</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {done ? (
          <div className="text-green-600">Password updated — redirecting to sign in…</div>
        ) : (
          <>
            <div className="relative w-full mb-2">
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" type={show ? "text" : "password"} className="w-full p-2 border rounded" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-2 text-sm text-gray-500">{show ? "Hide" : "Show"}</button>
            </div>
            <div className="relative w-full mb-4">
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" type={show ? "text" : "password"} className="w-full p-2 border rounded" />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded">Set password</button>
          </>
        )}
      </form>
    </main>
  );
}
