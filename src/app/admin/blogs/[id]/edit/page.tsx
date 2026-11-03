import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BlogForm } from "@/components/admin/blogs/BlogForm";
import { getBlogForEdit, getTagNames } from "@/lib/queries/admin-blogs";
import { FormSkeleton } from "@/components/admin/blogs/FormSkeleton";

export const metadata: Metadata = { title: "Edit blog | Admin" };

export default function EditBlogPage({ params }: PageProps<"/admin/blogs/[id]/edit">) {
  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-8">
      <Suspense fallback={<FormSkeleton />}>
        <EditBlogForm params={params} />
      </Suspense>
    </main>
  );
}

async function EditBlogForm({ params }: Pick<PageProps<"/admin/blogs/[id]/edit">, "params">) {
  const { id } = await params;
  const [blog, tagSuggestions] = await Promise.all([getBlogForEdit(id), getTagNames()]);
  if (!blog) notFound();

  return (
    <BlogForm
      // key: a fresh form for another blog, or when the blog changed elsewhere (e.g. unpublished
      // from the list), so the form never shows stale data
      key={`${blog.id}:${blog.updatedAt.getTime()}`}
      tagSuggestions={tagSuggestions}
      blog={{
        id: blog.id,
        status: blog.status,
        publishedAt: blog.publishedAt?.toISOString() ?? null,
        updatedAt: blog.updatedAt.toISOString(),
        title: blog.title,
        slug: blog.slug,
        description: blog.description,
        content: blog.content,
        thumbnail: blog.thumbnail ?? "",
        categoryId: blog.categoryId ?? "",
        tags: blog.tags.map((t) => t.name),
        seoTitle: blog.seoTitle ?? "",
        seoDescription: blog.seoDescription ?? "",
      }}
    />
  );
}
