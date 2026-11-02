"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/public/ThemeToggle";

/**
 * Dark mode button for pages that don't have the public header (all /admin pages).
 * Public pages (and the 404 page) already show the button in their header, so it hides there.
 */
export function FloatingThemeToggle() {
  const pathname = usePathname();
  if (!pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed right-4 bottom-4 z-40 rounded-lg bg-white shadow-lg">
      <ThemeToggle />
    </div>
  );
}
