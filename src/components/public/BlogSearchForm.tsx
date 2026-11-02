import Link from "next/link";
import Form from "next/form";
import { Search, X } from "lucide-react";
import { blogsPath, type BlogSort } from "@/lib/blog-utils";

/**
 * The big search box on the All blogs page.
 * Keeps the chosen category and sort when you search again; always goes back to page 1.
 */
export function BlogSearchForm({
    q,
    category,
    sort,
}: {
    q: string;
    category?: string;
    sort: BlogSort;
}) {
    return (
        <Form action="/blogs" role="search" className="flex w-full max-w-2xl gap-2">
            {category && <input type="hidden" name="category" value={category} />}
            {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}

            <div className="border-brand-400 focus-within:ring-brand-400 flex h-12 flex-1 items-center gap-2 rounded-lg border bg-white px-4 focus-within:ring-2">
                <Search className="text-brand-400 size-5 shrink-0" aria-hidden />
                <label htmlFor="blogs-search" className="sr-only">
                    Search blogs
                </label>
                {/* key: refill the box when the URL changes (e.g. after "Clear search") */}
                <input
                    key={q}
                    id="blogs-search"
                    name="q"
                    type="search"
                    defaultValue={q}
                    placeholder="Search blogs..."
                    className="text-brand-900 placeholder:text-brand-muted w-full bg-transparent outline-none"
                />
                {q && (
                    <Link
                        href={blogsPath({ category, sort })}
                        aria-label="Clear search"
                        className="text-brand-muted hover:text-brand-900 hover:bg-brand-50 -mr-2 flex size-8 shrink-0 items-center justify-center rounded-md"
                    >
                        <X className="size-4" />
                    </Link>
                )}
            </div>

            <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-small h-12 shrink-0 rounded-lg px-5 font-semibold text-white"
            >
                Search
            </button>
        </Form>
    );
}