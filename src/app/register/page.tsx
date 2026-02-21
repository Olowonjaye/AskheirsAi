"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const body = await res.json();
      if (!res.ok) return setError(body.error || "Registration failed");
      router.push("/login");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Registration failed");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create account</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full mb-2 p-2 border rounded" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full mb-2 p-2 border rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full mb-4 p-2 border rounded" />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
      </form>
    </main>
  );
}
