import Link from "next/link";
import { categoryPath } from "@/lib/blog-utils";
import type { CategoryWithCount } from "@/lib/queries/public-blogs";

/** All categories as cards (search lives in the site header). */
export function CategoryBrowser({ categories }: { categories: CategoryWithCount[] }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-brand-muted text-small">
        {categories.length} {categories.length === 1 ? "category" : "categories"}
      </p>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
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
    </div>
  );
}
