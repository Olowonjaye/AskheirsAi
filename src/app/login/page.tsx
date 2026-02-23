"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await signIn("credentials", { redirect: false, email, password });
      if (res?.error) return setError(res.error || "Sign in failed");
      if (res?.ok) return router.push("/chat");
      setError("Sign in failed");
    } catch (err) {
      setError((err as Error)?.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Sign in</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full mb-2 p-2 border rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full mb-4 p-2 border rounded" />
        <div className="text-right mb-4">
          <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
        </div>
        <button disabled={loading} className="w-full bg-green-600 text-white py-2 rounded">{loading ? "Signing in..." : "Sign In"}</button>
      </form>
    </main>
  );
}
