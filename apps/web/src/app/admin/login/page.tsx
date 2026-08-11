"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { adminApi, setToken } from "@/lib/admin-client";
import { Notice } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { accessToken } = await adminApi.login(email, password);
      setToken(accessToken);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg border bg-white p-6 shadow-editorial sm:p-8">
        <div className="text-2xl font-black">
          <span className="text-brand-600">ಗಾಳಿ</span> ಸುದ್ದಿ
        </div>
        <h1 className="headline mt-1 text-2xl">Newsroom Sign In</h1>
        <p className="mt-1 text-sm text-black/50">Reporters, editors and administrators.</p>

        {error && (
          <div className="mt-5">
            <Notice tone="error">{error}</Notice>
          </div>
        )}

        <label className="mt-6 block text-sm font-semibold">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold">
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </label>

        <button
          disabled={busy}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          <LogIn size={16} /> {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
