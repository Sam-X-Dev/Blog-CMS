import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogCard } from "@/components/public/BlogCard";
import { BlogMeta } from "@/components/public/BlogMeta";
import { BlogThumbnail } from "@/components/public/BlogThumbnail";
import { GridSkeleton } from "@/components/public/GridSkeleton";
import { ViewTracker } from "@/components/public/ViewTracker";
import { blogsPath, categoryPath } from "@/lib/blog-utils";
import { getPublishedBlog, getRelatedBlogs } from "@/lib/queries/public-blogs";
import { sanitizeBlogHtml } from "@/lib/sanitize";

type Props = PageProps<"/blog/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublishedBlog(slug);
  if (!blog) return { title: "Blog not found | BlogCMS" };

  return {
    title: `${blog.title} | BlogCMS`,
    description: blog.description,
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.description,
      publishedTime: blog.publishedAt?.toISOString(),
      // Social apps need a full https link, so local /thumbnails files are left out
      images: blog.thumbnail?.startsWith("https://") ? [blog.thumbnail] : undefined,
    },
  };
}

/** One blog, the way a reader sees it. Drafts and unknown links show the 404 page. */
export default function BlogPage({ params }: Props) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <BlogArticle params={params} />
    </Suspense>
  );
}

async function BlogArticle({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const blog = await getPublishedBlog(slug);
  if (!blog) notFound();

  // Cleaned again on the way out, so even old or imported content can't run scripts
  const html = sanitizeBlogHtml(blog.content);

  return (
    <>
      <ViewTracker blogId={blog.id} />

      <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-10 sm:px-6 sm:pt-14">
        <nav aria-label="Breadcrumb" className="text-brand-muted text-small flex flex-wrap gap-2">
          <Link href={blogsPath()} className="hover:text-brand-900 hover:underline">
            Blogs
          </Link>
          {blog.category && (
            <>
              <span aria-hidden>/</span>
              <Link
                href={categoryPath(blog.category.slug)}
                className="hover:text-brand-900 hover:underline"
              >
                {blog.category.name}
              </Link>
            </>
          )}
        </nav>

        <header className="flex flex-col gap-4">
          <h1 className="text-brand-900 text-display">{blog.title}</h1>
          <p className="text-brand-muted text-body">{blog.description}</p>
          <BlogMeta publishedAt={blog.publishedAt} readMinutes={blog.readMinutes} />
        </header>

        <BlogThumbnail
          src={blog.thumbnail}
          title={blog.title}
          eager
          sizes="(min-width: 768px) 720px, 100vw"
          className="aspect-[16/10] w-full rounded-2xl"
        />

        <BlogContent html={html} className="pt-2" />

        {blog.tags.length > 0 && (
          <ul aria-label="Tags" className="flex flex-wrap gap-2 pt-2">
            {blog.tags.map((tag) => (
              <li key={tag.slug}>
                <Link
                  href={blogsPath({ tag: tag.slug })}
                  className="bg-brand-50 border-brand-200 text-brand-900 hover:bg-brand-100 text-small inline-flex rounded-full border px-3 py-1.5 font-medium transition-colors"
                >
                  #{tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="border-brand-200 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
          <Link
            href={blogsPath()}
            className="text-brand-600 text-small font-semibold hover:underline"
          >
            ← All blogs
          </Link>
          {blog.category && (
            <Link
              href={categoryPath(blog.category.slug)}
              className="text-brand-600 text-small font-semibold hover:underline"
            >
              More in {blog.category.name} →
            </Link>
          )}
        </div>
      </article>

      <Suspense
        fallback={
          <RelatedFrame>
            <GridSkeleton />
          </RelatedFrame>
        }
      >
        <RelatedBlogs blogId={blog.id} categorySlug={blog.category?.slug} />
      </Suspense>
    </>
  );
}

async function RelatedBlogs({ blogId, categorySlug }: { blogId: string; categorySlug?: string }) {
  const blogs = await getRelatedBlogs(blogId, categorySlug, 3);
  if (blogs.length === 0) return <div className="pb-14" />;

  return (
    <RelatedFrame>
      <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((b) => (
          <BlogCard key={b.id} blog={b} />
        ))}
      </div>
    </RelatedFrame>
  );
}

function RelatedFrame({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="related-title"
      className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6"
    >
      <h2 id="related-title" className="text-brand-900 text-title">
        Keep reading
      </h2>
      {children}
    </section>
  );
}

function ArticleSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl animate-pulse flex-col gap-5 px-4 py-14 sm:px-6">
      <div className="bg-brand-50 h-4 w-32 rounded" />
      <div className="bg-brand-50 h-10 w-full rounded-lg" />
      <div className="bg-brand-50 h-10 w-2/3 rounded-lg" />
      <div className="bg-brand-50 h-4 w-48 rounded" />
      <div className="bg-brand-50 aspect-[16/10] w-full rounded-2xl" />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="bg-brand-50 h-4 w-full rounded" />
      ))}
    </div>
  );
}
