"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

/** Re-render when the "dark" class on <html> changes (from this button or another tab) */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDarkNow = () => document.documentElement.classList.contains("dark");

/** Sun / moon button. Saves the choice so the next visit opens in the same mode. */
export function ThemeToggle() {
  // On the server we don't know the reader's choice yet, so start with "light"
  const dark = useSyncExternalStore(subscribe, isDarkNow, () => false);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Private mode or blocked storage: the switch still works for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="text-brand-900 hover:bg-brand-50 border-brand-200 flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors"
    >
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}
