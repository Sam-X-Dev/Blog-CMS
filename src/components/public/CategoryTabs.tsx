import Link from "next/link";
import { trendingPath } from "@/lib/blog-utils";
import type { CategoryWithCount } from "@/lib/queries/public-blogs";

const base =
    "inline-flex min-h-11 items-center rounded-full border px-4 text-small font-medium whitespace-nowrap transition-colors";
const on = "bg-brand-600 border-brand-600 text-white";
const off = "border-brand-400 text-brand-900 hover:bg-brand-50";

/**
 * "All" + one pill per category. Used on the Trending page (default links)
 * and the All blogs page (`hrefFor` keeps the search and sort in the link).
 */
export function CategoryTabs({
    categories,
    active,
    hrefFor = trendingPath,
}: {
    categories: CategoryWithCount[];
    active?: string;
    hrefFor?: (categorySlug?: string) => string;
}) {
    const tabs = [{ slug: undefined, name: "All" }, ...categories];

    return (
        <nav aria-label="Filter by category" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex gap-2 pb-1 sm:flex-wrap">
                {tabs.map((t) => {
                    const isOn = t.slug === active;
                    return (
                        <li key={t.slug ?? "all"}>
                            <Link
                                href={hrefFor(t.slug)}
                                aria-current={isOn ? "page" : undefined}
                                className={`${base} ${isOn ? on : off}`}
                            >
                                {t.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}