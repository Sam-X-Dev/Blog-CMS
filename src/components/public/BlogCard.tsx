import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPath, categoryPath } from "@/lib/blog-utils";
import type { BlogCardData } from "@/lib/queries/public-blogs";
import { BlogMeta } from "./BlogMeta";
import { BlogThumbnail } from "./BlogThumbnail";

/** One blog in a grid. Used on the homepage and (later) the blogs list. */
export function BlogCard({ blog }: { blog: BlogCardData }) {
    const href = blogPath(blog.slug);

    return (
        <article className="group flex flex-col gap-3">
            {/* The title below is the main link; this one is for mouse users only */}
            <Link href={href} tabIndex={-1} aria-hidden className="overflow-hidden rounded-xl">
                <BlogThumbnail
                    src={blog.thumbnail}
                    title={blog.title}
                    className="aspect-[16/10] w-full transition-transform duration-300 group-hover:scale-[1.03]"
                />
            </Link>

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

            <p className="text-brand-muted text-small line-clamp-2">{blog.description}</p>

            <BlogMeta publishedAt={blog.publishedAt} readMinutes={blog.readMinutes} />

            <Link
                href={href}
                aria-label={`Read more: ${blog.title}`}
                className="text-brand-600 text-small mt-auto inline-flex items-center gap-1 self-start font-semibold hover:underline"
            >
                Read more
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
        </article>
    );
}