import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BlogCard } from "@/components/public/BlogCard";
import { GridSkeleton } from "@/components/public/GridSkeleton";
import { Pagination } from "@/components/public/Pagination";
import { categoryPath, toPageNumber, trendingPath } from "@/lib/blog-utils";
import { getCategoryBlogs, getCategoryBySlug } from "@/lib/queries/public-blogs";

type Props = PageProps<"/categories/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) return { title: "Category not found | BlogCMS" };
    return {
        title: `${category.name} blogs | BlogCMS`,
        description: `All published blogs in ${category.name}.`,
    };
}

export default function CategoryPage({ params, searchParams }: Props) {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
            <Suspense fallback={<GridSkeleton />}>
                <CategoryContent params={params} searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

async function CategoryContent({ params, searchParams }: Props) {
    const { slug } = await params;
    const page = toPageNumber((await searchParams).page);

    const category = await getCategoryBySlug(slug);
    if (!category) notFound();

    const { blogs, total, totalPages } = await getCategoryBlogs(category.slug, page);

    return (
        <>
            <div className="flex flex-col gap-3">
                <nav aria-label="Breadcrumb" className="text-brand-muted text-small flex gap-2">
                    <Link href="/categories" className="hover:text-brand-900 hover:underline">
                        Categories
                    </Link>
                    <span aria-hidden>/</span>
                    <span aria-current="page" className="text-brand-900">
                        {category.name}
                    </span>
                </nav>
                <h1 className="text-brand-900 text-display">
                    {category.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    <p className="text-brand-muted">
                        {total} {total === 1 ? "blog" : "blogs"}
                    </p>
                    <Link
                        href={trendingPath(category.slug)}
                        className="text-brand-600 text-small font-semibold hover:underline"
                    >
                        Trending in {category.name} →
                    </Link>
                </div>
            </div>

            {blogs.length === 0 ? (
                <div className="border-brand-200 bg-brand-50 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
                    <p className="text-brand-900 text-body font-semibold">
                        {page > 1 ? "This page is empty." : `No blogs in ${category.name} yet.`}
                    </p>
                    <Link
                        href={page > 1 ? categoryPath(category.slug) : "/categories"}
                        className="text-brand-600 text-small font-semibold hover:underline"
                    >
                        {page > 1 ? "Go to the first page" : "Browse other categories"}
                    </Link>
                </div>
            ) : (
                <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((blog) => (
                        <BlogCard key={blog.id} blog={blog} />
                    ))}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} basePath={categoryPath(category.slug)} />
        </>
    );
}