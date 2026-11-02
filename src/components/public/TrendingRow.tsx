import Link from "next/link";
import { Eye } from "lucide-react";
import { blogPath, categoryPath } from "@/lib/blog-utils";
import type { TrendingBlog } from "@/lib/queries/public-blogs";
import { BlogMeta } from "./BlogMeta";
import { BlogThumbnail } from "./BlogThumbnail";

const viewFormat = new Intl.NumberFormat("en-IN");

/** One ranked row on the Trending page: #1, small image, title, views this week. */
export function TrendingRow({ blog, rank }: { blog: TrendingBlog; rank: number }) {
    const href = blogPath(blog.slug);

    return (
        <li className="border-brand-200 flex items-start gap-4 border-b py-5 last:border-b-0 sm:gap-6">
            <span
                aria-label={`Rank ${rank}`}
                className="text-brand-200 text-display w-8 shrink-0 tabular-nums sm:w-10"
            >
                {String(rank).padStart(2, "0")}
            </span>

            <Link
                href={href}
                tabIndex={-1}
                aria-hidden
                className="hidden shrink-0 overflow-hidden rounded-lg sm:block"
            >
                <BlogThumbnail
                    src={blog.thumbnail}
                    title={blog.title}
                    className="aspect-[16/10] w-40 text-title"
                />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                {blog.category && (
                    <Link
                        href={categoryPath(blog.category.slug)}
                        className="text-brand-600 self-start text-small font-semibold hover:underline"
                    >
                        {blog.category.name}
                    </Link>
                )}
                <h3 className="text-brand-900 text-heading">
                    <Link href={href} className="hover:text-brand-600">
                        {blog.title}
                    </Link>
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <BlogMeta publishedAt={blog.publishedAt} readMinutes={blog.readMinutes} />
                    <span className="text-brand-600 inline-flex items-center gap-1 text-small font-medium">
                        <Eye className="size-4" aria-hidden />
                        {viewFormat.format(blog.weekViews)} {blog.weekViews === 1 ? "view" : "views"} this week
                    </span>
                </div>
            </div>
        </li>
    );
}