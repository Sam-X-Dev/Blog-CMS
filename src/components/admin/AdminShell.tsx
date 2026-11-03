"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FileText,
  FolderTree,
  Images,
  LayoutDashboard,
  Menu,
  SquarePen,
  Tags,
  TrendingUp,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/public/LogoMark";
import { ThemeToggle } from "@/components/public/ThemeToggle";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/blogs", label: "All blogs", icon: FileText },
  { href: "/admin/blogs/new", label: "New blog", icon: SquarePen },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/media", label: "Media", icon: Images },
  { href: "/admin/trending", label: "Trending & Featured", icon: TrendingUp },
];

function isActive(href: string, pathname: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/blogs") {
    // "All blogs" covers the list and the edit pages, but not "New blog"
    return pathname === "/admin/blogs" || /^\/admin\/blogs\/(?!new)/.test(pathname);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Desktop: remember whether the sidebar is shown or hidden (per browser)
const SIDEBAR_KEY = "admin-sidebar";
const sidebarListeners = new Set<() => void>();
let sidebarHiddenFallback = false; // used if the browser blocks localStorage

function subscribeSidebar(onChange: () => void) {
  sidebarListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    sidebarListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function isSidebarHidden() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "hidden";
  } catch {
    return sidebarHiddenFallback;
  }
}

function setSidebarHidden(hidden: boolean) {
  sidebarHiddenFallback = hidden;
  try {
    localStorage.setItem(SIDEBAR_KEY, hidden ? "hidden" : "shown");
  } catch {
    // blocked storage: the fallback above still works for this visit
  }
  sidebarListeners.forEach((l) => l());
}

const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

/**
 * Desktop: sidebar you can hide / show with the hamburger (choice is remembered).
 * Phones and tablets: top bar + slide-in menu.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const drawerOpen = menuFor === pathname; // closes by itself after navigating
  const hidden = useSyncExternalStore(subscribeSidebar, isSidebarHidden, () => false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuFor(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Top-bar hamburger: on desktop it brings the sidebar back, on phones it opens the menu
  function openMenu() {
    if (isDesktop()) setSidebarHidden(false);
    else setMenuFor(drawerOpen ? null : pathname);
  }

  return (
    <div className="flex min-h-screen flex-1">
      {/* Desktop sidebar */}
      {!hidden && (
        <aside className="border-brand-200 sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-white lg:flex">
          <Sidebar
            pathname={pathname}
            menuButton={
              <MenuButton label="Hide sidebar" expanded onClick={() => setSidebarHidden(true)} />
            }
          />
        </aside>
      )}

      {/* Phone / tablet */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuFor(null)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="border-brand-200 relative flex h-full w-72 max-w-[85vw] flex-col border-r bg-white shadow-xl">
            <Sidebar
              pathname={pathname}
              menuButton={
                <MenuButton label="Close menu" expanded close onClick={() => setMenuFor(null)} />
              }
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar: always on phones; on desktop only while the sidebar is hidden */}
        <header
          className={`border-brand-200 sticky top-0 z-30 flex items-center gap-3 border-b bg-white/90 px-4 py-3 backdrop-blur ${
            hidden ? "" : "lg:hidden"
          }`}
        >
          <MenuButton
            label={drawerOpen ? "Close menu" : "Open menu"}
            expanded={drawerOpen}
            close={drawerOpen}
            onClick={openMenu}
          />
          <AdminLogo />
        </header>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

function MenuButton({
  label,
  expanded,
  close = false,
  onClick,
}: {
  label: string;
  expanded: boolean;
  close?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      title={label}
      className="text-brand-900 hover:bg-brand-50 border-brand-200 flex size-10 shrink-0 items-center justify-center rounded-lg border"
    >
      {close ? <X className="size-5" /> : <Menu className="size-5" />}
    </button>
  );
}

function AdminLogo() {
  return (
    <Link href="/admin" className="text-heading flex items-center gap-2">
      <LogoMark className="size-7 shrink-0" />
      <span className="tracking-tight">
        <span className="text-brand-900 font-extrabold">Blog</span>
        <span className="text-brand-400 font-normal">CMS</span>
      </span>
      <span className="bg-brand-100 text-brand-900 text-caption ml-1 rounded-full px-2 py-0.5 font-semibold">
        Admin
      </span>
    </Link>
  );
}

function Sidebar({ pathname, menuButton }: { pathname: string; menuButton: React.ReactNode }) {
  return (
    <>
      <div className="border-brand-200 flex items-center gap-3 border-b px-4 py-3">
        {menuButton}
        <AdminLogo />
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`text-small flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                    active
                      ? "bg-brand-100 text-brand-900"
                      : "text-brand-muted hover:bg-brand-50 hover:text-brand-900"
                  }`}
                >
                  <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-brand-200 flex items-center gap-2 border-t px-4 py-4">
        <Link
          href="/"
          target="_blank"
          className="border-brand-200 text-brand-900 hover:bg-brand-50 text-small flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border font-medium"
        >
          <ExternalLink className="size-4" /> View site
        </Link>
        <ThemeToggle />
      </div>
    </>
  );
}
