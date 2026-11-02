"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { categoryPath } from "@/lib/blog-utils";
import type { CategoryWithCount } from "@/lib/queries/public-blogs";

/** Search box + category cards. Filters as you type, no page reload. */
export function CategoryBrowser({ categories }: { categories: CategoryWithCount[] }) {
    const [query, setQuery] = useState("");
    const q = query.trim().toLowerCase();
    const shown = q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories;

    return (
        <div className="flex flex-col gap-6">
            <div className="border-brand-400 focus-within:ring-brand-400 flex h-12 max-w-md items-center gap-2 rounded-lg border bg-white px-4 focus-within:ring-2">
                <Search className="text-brand-400 size-5 shrink-0" aria-hidden />
                <label htmlFor="category-search" className="sr-only">
                    Search categories
                </label>
                <input
                    id="category-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search categories..."
                    className="text-brand-900 placeholder:text-brand-muted w-full bg-transparent outline-none"
                />
            </div>

            <p className="text-brand-muted text-small" aria-live="polite">
                {shown.length === categories.length
                    ? `${categories.length} categories`
                    : `${shown.length} of ${categories.length} categories`}
            </p>

            {shown.length === 0 ? (
                <p className="border-brand-200 bg-brand-50 text-brand-muted rounded-xl border border-dashed px-6 py-12 text-center">
                    No category matches &ldquo;{query.trim()}&rdquo;.
                </p>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {shown.map((c) => (
                        <li key={c.id}>
                            <Link
                                href={categoryPath(c.slug)}
                                className="border-brand-200 hover:border-brand-400 hover:bg-brand-50 group flex items-center justify-between gap-4 rounded-xl border p-5 transition-colors"
                            >
                                <span className="flex flex-col gap-1">
                                    <span className="text-brand-900 text-heading">{c.name}</span>
                                    <span className="text-brand-muted text-small">
                                        {c.count} {c.count === 1 ? "blog" : "blogs"}
                                    </span>
                                </span>
                                <span
                                    aria-hidden
                                    className="text-brand-400 group-hover:text-brand-600 text-heading transition-transform group-hover:translate-x-1"
                                >
                                    →
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}