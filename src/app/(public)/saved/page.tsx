import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { BlogCard } from "@/components/public/BlogCard";
import { GridSkeleton } from "@/components/public/GridSkeleton";
import { PageIntro } from "@/components/public/PageIntro";
import { blogsPath } from "@/lib/blog-utils";
import { getSavedBlogs } from "@/lib/queries/public-blogs";
import { getUser } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "Saved blogs | BlogCMS",
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <PageIntro title="Saved blogs" subtitle="Blogs you saved to read later." />
      <Suspense fallback={<GridSkeleton count={3} />}>
        <SavedList />
      </Suspense>
    </div>
  );
}

async function SavedList() {
  const user = await getUser();
  if (!user) redirect("/login?next=/saved");

  const blogs = await getSavedBlogs(user.userId);
  if (blogs.length === 0) {
    return (
      <div className="border-brand-200 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center">
        <Bookmark className="text-brand-400 size-8" aria-hidden />
        <p className="text-brand-900 text-heading">No saved blogs yet</p>
        <p className="text-brand-muted text-small max-w-sm">
          Tap &ldquo;Save&rdquo; on any blog and it will show up here.
        </p>
        <Link
          href={blogsPath()}
          className="bg-brand-600 hover:bg-brand-700 text-small mt-1 rounded-lg px-4 py-2.5 font-semibold text-white"
        >
          Browse blogs
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-brand-muted text-small -mt-4">
        {blogs.length} saved {blogs.length === 1 ? "blog" : "blogs"}
      </p>
      <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </>
  );
}
