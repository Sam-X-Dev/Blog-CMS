import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BlogCard } from "@/components/public/BlogCard";
import { CategoryChips } from "@/components/public/CategoryChips";
import { FeaturedBlog } from "@/components/public/FeaturedBlog";
import { HomeSkeleton } from "@/components/public/HomeSkeleton";
import { getCategoriesWithBlogs, getLatestBlogs } from "@/lib/queries/public-blogs";

export const metadata: Metadata = {
    title: "BlogCMS | Latest blogs",
    description: "Read the latest blogs on programming, web development, cloud and tech careers.",
};

export default function HomePage() {
    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <h1 className="sr-only">BlogCMS</h1>
            {/* The page frame shows instantly; blogs stream in when the database answers */}
            <Suspense fallback={<HomeSkeleton />}>
                <HomeContent />
            </Suspense>
        </div>
    );
}

async function HomeContent() {
    const [blogs, categories] = await Promise.all([getLatestBlogs(7), getCategoriesWithBlogs()]);

    if (blogs.length === 0) return <NoBlogsYet />;

    const [featured, ...latest] = blogs;

    return (
        <div className="flex flex-col gap-14">
            <FeaturedBlog blog={featured} />

            {categories.length > 0 && <CategoryChips categories={categories} />}

            {latest.length > 0 && (
                <section aria-labelledby="latest-title" className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h2 id="latest-title" className="text-brand-900 text-title">
                            Latest blogs
                        </h2>
                        <Link href="/blogs" className="text-brand-600 text-small font-semibold hover:underline">
                            View all blogs →
                        </Link>
                    </div>

                    <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {latest.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function NoBlogsYet() {
    return (
        <div className="border-brand-200 bg-brand-50 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-20 text-center">
            <h2 className="text-brand-900 text-title">No blogs yet</h2>
            <p className="text-brand-muted max-w-md">
                New articles are on the way. Please check back soon.
            </p>
        </div>
    );
}