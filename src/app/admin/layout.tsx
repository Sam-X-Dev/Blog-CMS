import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin | BlogCMS",
  robots: { index: false, follow: false },
};

// Login / authentication is added by Samarth (e.g. a proxy.ts that protects /admin and the admin APIs).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-50 text-brand-900 flex min-h-full flex-1 flex-col">
      {/* Suspense: the sidebar reads the current URL to highlight the open page */}
      <Suspense fallback={<AdminLoading />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </div>
  );
}

function AdminLoading() {
  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <div className="border-brand-200 border-t-brand-600 size-8 animate-spin rounded-full border-4" />
    </div>
  );
}
