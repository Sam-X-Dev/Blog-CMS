"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { HeaderSearch } from "./HeaderSearch";
import { NavLinkList } from "./NavLinks";

/** Same size as the real button, shown while the menu loads (keeps the header from jumping) */
export function MenuButtonPlaceholder() {
  return <div className="size-10 shrink-0 md:hidden" aria-hidden />;
}

/** Hamburger menu for phones and small tablets (hidden from 768px up). */
export function MobileMenu() {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so it closes by itself after you navigate
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  // Escape closes it
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenOn(open ? null : pathname)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="text-brand-900 hover:bg-brand-50 border-brand-200 flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors md:hidden"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="border-brand-200 absolute inset-x-0 top-full border-b bg-white shadow-lg md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
            <HeaderSearch id="mobile-search" className="w-full" />
            <NavLinkList pathname={pathname} vertical />
          </div>
        </div>
      )}
    </>
  );
}
