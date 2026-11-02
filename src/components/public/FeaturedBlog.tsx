import Link from "next/link";
import { blogPath } from "@/lib/blog-utils";
import type { BlogCardData } from "@/lib/queries/public-blogs";
import { BlogMeta } from "./BlogMeta";
import { BlogThumbnail } from "./BlogThumbnail";

/** The newest blog, shown big at the top of the homepage. */
export function FeaturedBlog({ blog }: { blog: BlogCardData }) {
    const href = blogPath(blog.slug);

    return (
        <section
            aria-labelledby="featured-title"
            className="grid items-center gap-8 md:grid-cols-2 md:gap-10"
        >
            <Link href={href} tabIndex={-1} aria-hidden className="overflow-hidden rounded-2xl">
                <BlogThumbnail
                    src={blog.thumbnail}
                    title={blog.title}
                    eager
                    className="aspect-[16/10] w-full transition-transform duration-300 hover:scale-[1.02]"
                />
            </Link>

            <div className="flex flex-col items-start gap-4">
                <span className="bg-brand-100 text-brand-600 rounded-full px-3 py-1 text-small font-semibold">
                    Featured{blog.category && ` · ${blog.category.name}`}
                </span>

                <h2
                    id="featured-title"
                    className="text-brand-900 text-title sm:text-display"
                >
                    <Link href={href} className="hover:text-brand-600">
                        {blog.title}
                    </Link>
                </h2>

                <p className="text-brand-muted text-body">{blog.description}</p>

                <BlogMeta publishedAt={blog.publishedAt} readMinutes={blog.readMinutes} />

                <Link
                    href={href}
                    className="bg-brand-600 hover:bg-brand-700 inline-flex min-h-11 items-center rounded-lg px-5 text-small font-semibold text-white transition-colors"
                >
                    Read blog
                </Link>
            </div>
        </section>
    );
}