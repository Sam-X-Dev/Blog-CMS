import { Suspense } from "react";
import Link from "next/link";
import { blogsPath } from "@/lib/blog-utils";
import { getLatestBlogs, getMostReadThisWeek } from "@/lib/queries/public-blogs";
import { BlogCard } from "./BlogCard";
import { BlogSearchForm } from "./BlogSearchForm";

/** The body of every 404 page: message, search, quick links and a few blogs to read instead. */
export function NotFoundContent() {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-16 sm:px-6 sm:py-24">
            <section className="flex flex-col items-center gap-6 text-center">
                <p className="text-brand-400 text-display tabular-nums">404</p>
                <div className="flex flex-col gap-3">
                    <h1 className="text-brand-900 text-title">Page not found</h1>
                    <p className="text-brand-muted text-body mx-auto max-w-md">
                        This page may have moved, or the link is wrong. Try searching, or pick one of the links
                        below.
                    </p>
                </div>

                <div className="flex w-full justify-center">
                    <BlogSearchForm q="" sort="newest" />
                </div>

                <nav
                    aria-label="Helpful links"
                    className="text-small flex flex-wrap items-center justify-center gap-3"
                >
                    <Link
                        href="/"
                        className="bg-brand-600 hover:bg-brand-700 inline-flex min-h-11 items-center rounded-lg px-5 font-semibold text-white"
                    >
                        Go to homepage
                    </Link>
                    <Link
                        href={blogsPath()}
                        className="border-brand-400 text-brand-900 hover:bg-brand-50 inline-flex min-h-11 items-center rounded-lg border px-5 font-medium"
                    >
                        Browse all blogs
                    </Link>
                    <Link
                        href="/categories"
                        className="border-brand-400 text-brand-900 hover:bg-brand-50 inline-flex min-h-11 items-center rounded-lg border px-5 font-medium"
                    >
                        Categories
                    </Link>
                </nav>
            </section>

            <Suspense fallback={null}>
                <SuggestedBlogs />
            </Suspense>
        </div>
    );
}

/** 3 blogs to read instead: most read this week, or the newest if nobody has read anything yet */
async function SuggestedBlogs() {
    const popular = await getMostReadThisWeek(undefined, 3);
    const blogs = popular.length > 0 ? popular : await getLatestBlogs(3);
    if (blogs.length === 0) return null;

    return (
        <section aria-labelledby="suggested-title" className="flex flex-col gap-6">
            <h2 id="suggested-title" className="text-brand-900 text-title">
                {popular.length > 0 ? "Popular right now" : "Latest blogs"}
            </h2>
            <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                ))}
            </div>
        </section>
    );
}