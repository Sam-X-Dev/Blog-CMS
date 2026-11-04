"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiFetch } from "@/lib/api-client";
import { safeNextPath } from "@/lib/safe-next";
import { EMAIL_MESSAGE, isValidEmail } from "@/lib/validations/email";
import { refreshCurrentUser } from "@/lib/use-current-user";

const input =
  "border-brand-400 focus:ring-brand-400 text-brand-900 placeholder:text-brand-muted w-full rounded-lg border bg-white px-3.5 py-2.5 text-small outline-none focus:ring-2";

type Errors = Partial<Record<"name" | "email" | "password", string>>;

/** Reader log in and sign up (one form, two modes). */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const [name, setName] = useState("");
  // "Sign up with this email" from the login page fills the email in
  const [email, setEmail] = useState(signup ? (params.get("email") ?? "") : "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [noAccount, setNoAccount] = useState(false);
  const [busy, setBusy] = useState(false);

  function check(): Errors {
    const e: Errors = {};
    if (signup && name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!email.trim()) e.email = "Email is required";
    else if (!isValidEmail(email)) e.email = EMAIL_MESSAGE;
    if (signup ? password.length < 8 : !password)
      e.password = signup ? "Password must be at least 8 characters" : "Enter your password";
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setNoAccount(false);
    const local = check();
    setErrors(local);
    if (Object.keys(local).length) return;

    setBusy(true);
    try {
      await apiFetch(signup ? "/api/users/register" : "/api/users/login", {
        method: "POST",
        body: JSON.stringify(signup ? { name, email, password } : { email, password }),
      });
      await refreshCurrentUser();
      toast.success(
        signup ? `Welcome, ${name.trim().split(" ")[0]}! Your account is ready.` : "Logged in"
      );
      router.replace(next);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors({
          name: err.errors.name?.[0],
          email: err.errors.email?.[0],
          password: err.errors.password?.[0],
        });
      }
      setMessage(err instanceof ApiError ? err.message : "Could not reach the server. Try again.");
      setNoAccount(!signup && err instanceof ApiError && err.status === 404);
      setBusy(false);
    }
  }

  const switchHref = `${signup ? "/login" : "/signup"}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;
  const signupWithEmail = `/signup?${new URLSearchParams({
    email: email.trim(),
    ...(next !== "/" ? { next } : {}),
  })}`;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {signup && (
        <Field label="Name" error={errors.name}>
          <input
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={50}
            className={input}
          />
        </Field>
      )}
      <Field label="Email" error={errors.email}>
        <input
          type="email"
          autoComplete="email"
          autoFocus={!signup}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={input}
        />
      </Field>
      <Field label="Password" error={errors.password}>
        <span className="relative block">
          <input
            type={show ? "text" : "password"}
            autoComplete={signup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={signup ? "At least 8 characters" : ""}
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
      </Field>

      {message && (
        <p
          role="alert"
          className="text-small rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950/40 dark:text-red-300"
        >
          {message}
          {noAccount && (
            <>
              {" "}
              <Link href={signupWithEmail} className="font-semibold underline">
                Sign up with this email
              </Link>
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="bg-brand-600 hover:bg-brand-700 text-small flex h-11 items-center justify-center gap-2 rounded-lg font-semibold text-white disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {busy ? (signup ? "Creating account..." : "Logging in...") : signup ? "Sign up" : "Log in"}
      </button>

      <p className="text-small text-brand-muted text-center">
        {signup ? "Already have an account?" : "New here?"}{" "}
        <Link href={switchHref} className="text-brand-600 font-semibold hover:underline">
          {signup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-small text-brand-900 font-medium">{label}</span>
      {children}
      {error && <span className="text-caption text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}
