import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/public/LogoMark";
import { getUser } from "@/lib/user-auth";
import { safeNextPath } from "@/lib/safe-next";
import { AuthForm } from "./AuthForm";

type Props = {
  mode: "login" | "signup";
  searchParams: Promise<{ next?: string | string[] }>;
};

/** Log in / sign up page body. Readers who are already logged in go straight on. */
export function AuthPage({ mode, searchParams }: Props) {
  const signup = mode === "signup";
  return (
    <div className="flex justify-center px-4 py-12 sm:py-16">
      <div className="border-brand-200 w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <LogoMark className="size-12" />
          <div>
            <h1 className="text-brand-900 text-title">
              {signup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-brand-muted text-small mt-1">
              {signup
                ? "Like, save and comment on blogs. Free, takes 10 seconds."
                : "Log in to like, save and comment on blogs."}
            </p>
          </div>
        </div>
        <Suspense fallback={<div className="bg-brand-50 h-64 animate-pulse rounded-lg" />}>
          <AlreadyLoggedIn searchParams={searchParams} />
          <AuthForm mode={mode} />
        </Suspense>
      </div>
    </div>
  );
}

async function AlreadyLoggedIn({ searchParams }: Pick<Props, "searchParams">) {
  if (await getUser()) {
    const next = (await searchParams).next;
    redirect(safeNextPath(Array.isArray(next) ? next[0] : next));
  }
  return null;
}
