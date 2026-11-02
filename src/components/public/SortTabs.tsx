import Link from "next/link";
import { BLOG_SORTS, blogsPath, type BlogSort } from "@/lib/blog-utils";

/** Newest / Oldest / Most read switch on the All blogs page. Keeps search and category. */
export function SortTabs({ q, category, sort }: { q: string; category?: string; sort: BlogSort }) {
    return (
        <nav aria-label="Sort blogs" className="flex items-center gap-3">
            <span className="text-brand-muted text-small">Sort:</span>
            <ul className="border-brand-200 bg-brand-50 flex gap-1 rounded-lg border p-1">
                {BLOG_SORTS.map((s) => {
                    const on = s.id === sort;
                    return (
                        <li key={s.id}>
                            <Link
                                href={blogsPath({ q, category, sort: s.id })}
                                aria-current={on ? "true" : undefined}
                                className={`text-small inline-flex min-h-9 items-center rounded-md px-3 font-medium whitespace-nowrap transition-colors ${on ? "text-brand-900 bg-white shadow-sm" : "text-brand-muted hover:text-brand-900"
                                    }`}
                            >
                                {s.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}