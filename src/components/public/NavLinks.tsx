"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/trending", label: "Trending" },
];

function isActive(href: string, pathname?: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The links themselves. Without a pathname, nothing is highlighted. */
export function NavLinkList({ pathname }: { pathname?: string }) {
  return (
    <nav aria-label="Main" className="text-small flex items-center gap-6 font-medium">
      {LINKS.map(({ href, label }) => {
        const active = isActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "text-brand-900 decoration-brand-400 underline decoration-2 underline-offset-8"
                : "text-brand-muted hover:text-brand-900 transition-colors"
            }
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
