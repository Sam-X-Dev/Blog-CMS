import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin | BlogCMS",
  robots: { index: false, follow: false },
};

/** Every /admin page: login check + sidebar. The login page itself gets no sidebar. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-50 text-brand-900 flex min-h-full flex-1 flex-col">
      {/* Suspense: reading the login cookie and the URL happens per request */}
      <Suspense fallback={<AdminLoading />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </div>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  // Set by proxy.ts (which overwrites any value the browser sends)
  const path = (await headers()).get("x-admin-path");
  if (path === "/admin/login") return children;

  const admin = await requireAdminPage(); // not logged in → /admin/login
  return <AdminShell admin={{ name: admin.name, email: admin.email }}>{children}</AdminShell>;
}

function AdminLoading() {
  return (
    <div
      className="flex flex-1 items-center justify-center p-10"
      role="status"
      aria-label="Loading"
    >
      <div className="border-brand-200 border-t-brand-600 size-8 animate-spin rounded-full border-4" />
    </div>
  );
}
