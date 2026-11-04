import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { BlogFilters } from "@/components/admin/blogs/BlogFilters";
import { BlogRowActions } from "@/components/admin/blogs/BlogRowActions";
import { StatusBadge } from "@/components/admin/blogs/StatusBadge";
import { BlogThumbnail } from "@/components/public/BlogThumbnail";
import { Pagination } from "@/components/public/Pagination";
import { formatDate } from "@/lib/blog-utils";
import {
  getAdminCategoryOptions,
  listAdminBlogs,
  parseAdminBlogQuery,
  type AdminBlogQuery,
} from "@/lib/queries/admin-blogs";

export const metadata: Metadata = { title: "All blogs | Admin" };

/** Link to this page with the current filters (defaults left out). */
function adminBlogsPath(q: AdminBlogQuery, page = 1) {
  const p = new URLSearchParams();
  if (q.q) p.set("q", q.q);
  if (q.status !== "all") p.set("status", q.status);
  if (q.category) p.set("category", q.category);
  if (q.sort !== "updated") p.set("sort", q.sort);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/admin/blogs?${s}` : "/admin/blogs";
}

export default function AdminBlogsPage({ searchParams }: PageProps<"/admin/blogs">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-brand-900 text-title">All blogs</h1>
          <p className="text-brand-muted text-small mt-1">
            Edit, publish, unpublish or delete any blog. Drafts are only visible here.
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="bg-brand-600 hover:bg-brand-700 text-small inline-flex h-10 items-center gap-2 rounded-lg px-4 font-semibold text-white"
        >
          <Plus className="size-4" /> New blog
        </Link>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <BlogsTable searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function BlogsTable({ searchParams }: Pick<PageProps<"/admin/blogs">, "searchParams">) {
  const query = parseAdminBlogQuery(await searchParams);
  const [{ blogs, total, page, totalPages }, categories] = await Promise.all([
    listAdminBlogs(query),
    getAdminCategoryOptions(),
  ]);
  const filtered = Boolean(query.q || query.status !== "all" || query.category);

  return (
    <>
      <BlogFilters query={query} categories={categories} />

      <p className="text-brand-muted text-small" aria-live="polite">
        {total.toLocaleString("en-IN")} {total === 1 ? "blog" : "blogs"}
        {filtered && " match these filters"}
      </p>

      {blogs.length === 0 ? (
        <div className="border-brand-200 flex flex-col items-center gap-3 rounded-xl border border-dashed bg-white px-6 py-14 text-center">
          <p className="text-brand-900 text-heading">
            {filtered ? "No blogs match" : "No blogs found."}
          </p>
          {!filtered && <p className="text-brand-muted text-small">Create your first blog.</p>}
          {filtered ? (
            <Link
              href="/admin/blogs"
              className="text-brand-600 text-small font-semibold hover:underline"
            >
              Clear filters
            </Link>
          ) : (
            <Link
              href="/admin/blogs/new"
              className="bg-brand-600 hover:bg-brand-700 text-small mt-1 inline-flex h-10 items-center rounded-lg px-4 font-semibold text-white"
            >
              Create Blog
            </Link>
          )}
        </div>
      ) : (
        <ul className="border-brand-200 divide-brand-200 divide-y overflow-hidden rounded-xl border bg-white">
          {blogs.map((b) => (
            <li key={b.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href={`/admin/blogs/${b.id}/edit`}
                className="hidden shrink-0 overflow-hidden rounded-lg sm:block"
                tabIndex={-1}
                aria-hidden
              >
                <BlogThumbnail
                  src={b.thumbnail}
                  title={b.title}
                  sizes="96px"
                  className="aspect-[16/10] w-24 text-xl"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={b.status} />
                  {b.isFeatured && <Flag>Featured</Flag>}
                  {b.isTrending && <Flag>Editor&apos;s pick</Flag>}
                </div>
                <Link
                  href={`/admin/blogs/${b.id}/edit`}
                  className="text-brand-900 text-body font-semibold break-words hover:underline"
                >
                  {b.title}
                </Link>
                <p className="text-brand-muted text-caption flex flex-wrap gap-x-3 gap-y-1">
                  <span className="break-all">/blog/{b.slug}</span>
                  <span>{b.category?.name ?? "No category"}</span>
                  {b.tags.length > 0 && <span>{b.tags.map((t) => `#${t.name}`).join(" ")}</span>}
                  <span>
                    {b.status === "PUBLISHED" && b.publishedAt
                      ? `Published ${formatDate(b.publishedAt)}`
                      : `Created ${formatDate(b.createdAt)}`}
                    {" · "}Edited {formatDate(b.updatedAt)}
                  </span>
                </p>
              </div>

              <BlogRowActions id={b.id} title={b.title} slug={b.slug} status={b.status} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} hrefFor={(n) => adminBlogsPath(query, n)} />
    </>
  );
}

function Flag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-brand-100 text-brand-900 text-caption rounded-full px-2.5 py-1 font-semibold">
      {children}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-12 rounded-xl bg-white" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-24 rounded-xl bg-white" />
      ))}
    </div>
  );
}
