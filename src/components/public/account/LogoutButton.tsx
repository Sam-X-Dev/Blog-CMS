"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { markLoggedOut } from "@/lib/use-current-user";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      const res = await fetch("/api/users/logout", { method: "POST" });
      if (!res.ok) throw new Error();
      markLoggedOut();
      toast.success("Logged out");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Could not log out. Please try again.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="text-small inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
    >
      <LogOut className="size-4" /> {busy ? "Logging out..." : "Log out"}
    </button>
  );
}
