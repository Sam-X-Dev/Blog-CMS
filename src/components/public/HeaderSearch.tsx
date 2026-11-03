"use client";

import Form from "next/form";
import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

type Props = { id: string; className?: string };

/** The search box itself. Sends you to /blogs?q=your+words */
export function HeaderSearchShell({
  id,
  className = "",
  q = "",
  keep = {},
}: Props & { q?: string; keep?: Record<string, string> }) {
  return (
    <Form
      action="/blogs"
      role="search"
      className={`border-brand-400 focus-within:ring-brand-400 flex h-10 items-center gap-2 rounded-lg border bg-white px-3 focus-within:ring-2 ${className}`}
    >
      {Object.entries(keep).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Search className="text-brand-400 size-4 shrink-0" aria-hidden />
      <label htmlFor={id} className="sr-only">
        Search blogs
      </label>
      {/* key: refill the box when the search in the URL changes */}
      <input
        key={q}
        id={id}
        name="q"
        type="search"
        defaultValue={q}
        placeholder="Search blogs..."
        className="text-brand-900 placeholder:text-brand-muted text-small w-full bg-transparent outline-none"
      />
    </Form>
  );
}

/**
 * The only search box on the site (header, and inside the mobile menu).
 * On the All blogs page it shows your current search and keeps the chosen category, tag and sort.
 */
export function HeaderSearch(props: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const onBlogs = pathname === "/blogs";

  const keep: Record<string, string> = {};
  if (onBlogs) {
    for (const name of ["category", "tag", "sort"]) {
      const value = params.get(name);
      if (value) keep[name] = value;
    }
  }

  return <HeaderSearchShell {...props} q={onBlogs ? (params.get("q") ?? "") : ""} keep={keep} />;
}
