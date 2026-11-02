import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BlogCard } from "@/components/public/BlogCard";
import { CategoryTabs } from "@/components/public/CategoryTabs";
import { GridSkeleton } from "@/components/public/GridSkeleton";
import { PageIntro } from "@/components/public/PageIntro";
import { TrendingRow } from "@/components/public/TrendingRow";
import {
    getCategoriesWithBlogs,
    getMostReadThisWeek,
    getTrendingPicks,
} from "@/lib/queries/public-blogs";

export const metadata: Metadata = {
    title: "Trending | BlogCMS",
    description: "Editor's picks and the most read blogs this week, overall and by category.",
};

export default function TrendingPage({ searchParams }: PageProps<"/trending">) {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
            <PageIntro
                title="Trending"
                subtitle="Editor's picks and the most read blogs in the last 7 days."
            />
            <Suspense fallback={<GridSkeleton count={3} />}>
                <TrendingContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

async function TrendingContent({ searchParams }: Pick<PageProps<"/trending">, "searchParams">) {
    const { category } = await searchParams;
    const categorySlug = typeof category === "string" && category ? category : undefined;

    const [categories, picks, popular] = await Promise.all([
        getCategoriesWithBlogs(),
        getTrendingPicks(categorySlug),
        getMostReadThisWeek(categorySlug),
    ]);

    // Don't show the same blog twice
    const pickIds = new Set(picks.map((b) => b.id));
    const mostRead = popular.filter((b) => !pickIds.has(b.id));
    const categoryName = categories.find((c) => c.slug === categorySlug)?.name;

    return (
        <>
            <CategoryTabs categories={categories} active={categorySlug} />

            {picks.length > 0 && (
                <section aria-labelledby="picks-title" className="flex flex-col gap-6">
                    <h2 id="picks-title" className="text-brand-900 text-title">
                        Editor&apos;s picks{categoryName && ` in ${categoryName}`}
                    </h2>
                    <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {picks.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                </section>
            )}

            {mostRead.length > 0 && (
                <section aria-labelledby="most-read-title" className="flex flex-col gap-2">
                    <h2 id="most-read-title" className="text-brand-900 text-title">
                        Most read this week{categoryName && ` in ${categoryName}`}
                    </h2>
                    <ol>
                        {mostRead.map((blog, i) => (
                            <TrendingRow key={blog.id} blog={blog} rank={i + 1} />
                        ))}
                    </ol>
                </section>
            )}

            {picks.length === 0 && mostRead.length === 0 && (
                <div className="border-brand-200 bg-brand-50 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
                    <p className="text-brand-900 text-body font-semibold">
                        Nothing trending {categoryName ? `in ${categoryName} ` : ""}yet
                    </p>
                    <p className="text-brand-muted max-w-md">
                        Blogs show up here once people start reading them.
                    </p>
                    <Link href="/" className="text-brand-600 text-small font-semibold hover:underline">
                        See the latest blogs
                    </Link>
                </div>
            )}
        </>
    );
}