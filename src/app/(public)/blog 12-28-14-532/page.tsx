import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BlogCard } from "@/components/public/BlogCard";
import { BlogSearchForm } from "@/components/public/BlogSearchForm";
import { CategoryTabs } from "@/components/public/CategoryTabs";
import { GridSkeleton } from "@/components/public/GridSkeleton";
import { PageIntro } from "@/components/public/PageIntro";
import { Pagination } from "@/components/public/Pagination";
import { SortTabs } from "@/components/public/SortTabs";
import { blogsPath, toPageNumber, toSearchText, toSort } from "@/lib/blog-utils";
import { getCategoriesWithBlogs, searchBlogs } from "@/lib/queries/public-blogs";

type Props = PageProps<"/blogs">;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const q = toSearchText((await searchParams).q);
    if (q) {
        // Search results are not useful in Google, so only the plain list gets indexed
        return { title: `Search: ${q} | BlogCMS`, robots: { index: false, follow: true } };
    }
    return {
        title: "All blogs | BlogCMS",
        description: "Search and browse every blog: programming, web development, cloud and careers.",
    };
}

export default function BlogsPage({ searchParams }: Props) {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
            <PageIntro title="All blogs" subtitle="Search by title, topic or category." />
            <Suspense fallback={<BlogsSkeleton />}>
                <BlogsContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

async function BlogsContent({ searchParams }: Pick<Props, "searchParams">) {
    const params = await searchParams;
    const q = toSearchText(params.q);
    const sort = toSort(params.sort);
    const page = toPageNumber(params.page);

    const categories = await getCategoriesWithBlogs();
    // Ignore a category that doesn't exist (or has no blogs) instead of showing nothing
    const rawCategory = Array.isArray(params.category) ? params.category[0] : params.category;
    const activeCategory = categories.find((c) => c.slug === rawCategory);
    const category = activeCategory?.slug;

    const { blogs, total, totalPages } = await searchBlogs({ q, categorySlug: category, sort, page });

    return (
        <>
            <div className="flex flex-col gap-5">
                <BlogSearchForm q={q} category={category} sort={sort} />
                {categories.length > 0 && (
                    <CategoryTabs
                        categories={categories}
                        active={category}
                        hrefFor={(slug) => blogsPath({ q, category: slug, sort })}
                    />
                )}
            </div>

            <div className="border-brand-200 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b pb-4">
                <p className="text-brand-900 text-body" aria-live="polite">
                    <ResultLine total={total} q={q} categoryName={activeCategory?.name} />
                </p>
                {total > 1 && <SortTabs q={q} category={category} sort={sort} />}
            </div>

            {blogs.length > 0 ? (
                <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((blog) => (
                        <BlogCard key={blog.id} blog={blog} />
                    ))}
                </div>
            ) : (
                <NoResults
                    q={q}
                    categoryName={activeCategory?.name}
                    pageTooFar={total > 0}
                    firstPage={blogsPath({ q, category, sort })}
                    clearSearch={blogsPath({ category, sort })}
                />
            )}

            <Pagination
                page={page}
                totalPages={totalPages}
                hrefFor={(n) => blogsPath({ q, category, sort, page: n })}
            />
        </>
    );
}

/** "12 blogs for “react” in Web Development" */
function ResultLine({
    total,
    q,
    categoryName,
}: {
    total: number;
    q: string;
    categoryName?: string;
}) {
    return (
        <>
            <span className="font-semibold">{total.toLocaleString("en-IN")}</span>{" "}
            {total === 1 ? "blog" : "blogs"}
            {q && (
                <>
                    {" "}
                    for <span className="font-semibold">&ldquo;{q}&rdquo;</span>
                </>
            )}
            {categoryName && (
                <>
                    {" "}
                    in <span className="font-semibold">{categoryName}</span>
                </>
            )}
        </>
    );
}

function NoResults({
    q,
    categoryName,
    pageTooFar,
    firstPage,
    clearSearch,
}: {
    q: string;
    categoryName?: string;
    pageTooFar: boolean;
    firstPage: string;
    clearSearch: string;
}) {
    const linkClass = "text-brand-600 text-small font-semibold hover:underline";

    return (
        <div className="border-brand-200 bg-brand-50 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
            {pageTooFar ? (
                <>
                    <p className="text-brand-900 text-heading">This page is empty.</p>
                    <Link href={firstPage} className={linkClass}>
                        Go to the first page
                    </Link>
                </>
            ) : q ? (
                <>
                    <p className="text-brand-900 text-heading">
                        No blogs match &ldquo;{q}&rdquo;{categoryName && ` in ${categoryName}`}
                    </p>
                    <p className="text-brand-muted max-w-md">
                        Check the spelling, or try a shorter or more general word.
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        <Link href={clearSearch} className={linkClass}>
                            Clear search
                        </Link>
                        <Link href="/categories" className={linkClass}>
                            Browse categories
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    <p className="text-brand-900 text-heading">No blogs yet</p>
                    <p className="text-brand-muted max-w-md">New blogs will show up here once published.</p>
                </>
            )}
        </div>
    );
}

function BlogsSkeleton() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex animate-pulse flex-col gap-5">
                <div className="bg-brand-50 h-12 w-full max-w-2xl rounded-lg" />
                <div className="flex gap-2">
                    {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="bg-brand-50 h-11 w-24 rounded-full" />
                    ))}
                </div>
            </div>
            <div className="bg-brand-50 h-6 w-48 animate-pulse rounded" />
            <GridSkeleton />
        </div>
    );
}