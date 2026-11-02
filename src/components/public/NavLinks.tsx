"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/trending", label: "Trending" },
  { href: "/about", label: "About" },
];

function isActive(href: string, pathname?: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The links themselves. Without a pathname, nothing is highlighted.
 * vertical: the stacked version used inside the mobile (hamburger) menu.
 */
export function NavLinkList({ pathname, vertical }: { pathname?: string; vertical?: boolean }) {
  return (
    <nav
      aria-label="Main"
      className={`text-small flex font-medium ${vertical ? "flex-col gap-1" : "items-center gap-6"}`}
    >
      {LINKS.map(({ href, label }) => {
        const active = isActive(href, pathname);
        const look = vertical
          ? `rounded-lg px-3 py-3 ${active ? "bg-brand-100 text-brand-900" : "text-brand-muted hover:bg-brand-50 hover:text-brand-900"}`
          : active
            ? "text-brand-900 decoration-brand-400 underline decoration-2 underline-offset-8"
            : "text-brand-muted hover:text-brand-900 transition-colors";
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={look}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Highlights the page you are on. */
export function NavLinks() {
  const pathname = usePathname();
  return <NavLinkList pathname={pathname} />;
}
