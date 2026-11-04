"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api-client";

const input =
  "border-brand-400 focus:ring-brand-400 text-brand-900 placeholder:text-brand-muted w-full rounded-lg border bg-white px-3.5 py-2.5 text-small outline-none focus:ring-2";

/** Only go back to admin pages after login (never to another website). */
function safeNext(next: string | null) {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      // Full page load so the admin layout starts fresh with the new session
      window.location.href = safeNext(params.get("next"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server. Try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-small text-brand-900 font-medium">Email</span>
        <input
          type="email"
          autoComplete="username"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          className={input}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-small text-brand-900 font-medium">Password</span>
        <span className="relative">
          <input
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${input} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="text-brand-muted hover:text-brand-900 absolute top-1/2 right-2 -translate-y-1/2 p-1"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="text-small rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !email || !password}
        className="bg-brand-600 hover:bg-brand-700 text-small flex h-11 items-center justify-center gap-2 rounded-lg font-semibold text-white disabled:opacity-50"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {busy ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
