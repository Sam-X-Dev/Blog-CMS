import Link from "next/link";
import { categoryPath } from "@/lib/blog-utils";
import type { CategoryWithCount } from "@/lib/queries/public-blogs";

export function CategoryChips({ categories }: { categories: CategoryWithCount[] }) {
    return (
        <section aria-labelledby="categories-title" className="flex flex-col gap-4">
            <h2 id="categories-title" className="text-brand-900 text-heading">
                Browse by category
            </h2>

            <ul className="flex flex-wrap gap-2.5">
                {categories.map((c) => (
                    <li key={c.id}>
                        <Link
                            href={categoryPath(c.slug)}
                            className="border-brand-400 text-brand-900 hover:bg-brand-50 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-small font-medium transition-colors"
                        >
                            {c.name}
                            <span className="text-brand-muted text-caption">{c.count}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}