import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/public/LogoMark";
import { ThemeToggle } from "@/components/public/ThemeToggle";

export const metadata: Metadata = { title: "Admin login | BlogCMS" };

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-brand-muted hover:text-brand-900 text-small flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="size-4" /> Back to website
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="border-brand-200 w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <LogoMark className="size-12" />
            <div>
              <h1 className="text-brand-900 text-title">Admin Login</h1>
              <p className="text-brand-muted text-small mt-1">Sign in to manage your blogs.</p>
            </div>
          </div>
          {/* Suspense: the form reads ?next= from the URL */}
          <Suspense fallback={<div className="bg-brand-50 h-56 animate-pulse rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
