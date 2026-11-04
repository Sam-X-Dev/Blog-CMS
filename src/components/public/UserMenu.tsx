"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, LogIn, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { loginHref, markLoggedOut, useCurrentUser } from "@/lib/use-current-user";

const iconButton =
  "text-brand-900 hover:bg-brand-50 border-brand-200 flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors";

/** Header: "Log in" for visitors, or the reader's initial with a small menu. */
export function UserMenu() {
  const { status, user } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname; // closes by itself after navigating
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (
        e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)
      )
        setOpenOn(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  async function logout() {
    setOpenOn(null);
    try {
      const res = await fetch("/api/users/logout", { method: "POST" });
      if (!res.ok) throw new Error();
      markLoggedOut();
      toast.success("Logged out");
      router.refresh();
    } catch {
      toast.error("Could not log out. Please try again.");
    }
  }

  if (status === "loading") return <div className="size-10 shrink-0" aria-hidden />;

  if (!user) {
    const href = pathname === "/login" || pathname === "/signup" ? "/login" : loginHref(pathname);
    return (
      <Link
        href={href}
        className={`${iconButton} lg:w-auto lg:gap-2 lg:px-3.5`}
        aria-label="Log in"
      >
        <LogIn className="size-[18px]" aria-hidden />
        <span className="text-small hidden font-semibold lg:inline">Log in</span>
      </Link>
    );
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpenOn(open ? null : pathname)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.name}`}
        title={user.name}
        className="bg-brand-100 text-brand-900 hover:ring-brand-400 text-small flex size-10 shrink-0 items-center justify-center rounded-full font-semibold transition-shadow hover:ring-2"
      >
        {user.name.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div
          role="menu"
          className="border-brand-200 absolute right-0 z-40 mt-2 w-60 rounded-xl border bg-white p-1.5 shadow-lg shadow-black/10"
        >
          <div className="border-brand-200 mb-1 border-b px-3 py-2.5">
            <p className="text-small text-brand-900 truncate font-semibold">{user.name}</p>
            <p className="text-caption text-brand-muted truncate">{user.email}</p>
          </div>
          <MenuLink href="/saved" icon={<Bookmark className="size-4" />} label="Saved blogs" />
          <MenuLink href="/account" icon={<UserRound className="size-4" />} label="My account" />
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="text-small flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="text-small text-brand-900 hover:bg-brand-50 flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium"
    >
      {icon}
      {label}
    </Link>
  );
}
