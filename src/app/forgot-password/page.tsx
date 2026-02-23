"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json();
        return setError(body?.error || "Failed to request password reset");
      }
      setSent(true);
    } catch (err) {
      setError((err as Error)?.message ?? "Failed to request password reset");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Reset password</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {sent ? (
          <div className="text-green-600">If that email exists, a reset link was generated. Check server logs or your inbox.</div>
        ) : (
          <>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full mb-4 p-2 border rounded" />
            <button className="w-full bg-blue-600 text-white py-2 rounded">Send reset link</button>
          </>
        )}
      </form>
    </main>
  );
}
