import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogForm } from "@/components/admin/blogs/BlogForm";
import { FormSkeleton } from "@/components/admin/blogs/FormSkeleton";
import { getTagNames } from "@/lib/queries/admin-blogs";

export const metadata: Metadata = { title: "New blog | Admin" };

export default function NewBlogPage() {
  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-8">
      <Suspense fallback={<FormSkeleton />}>
        <NewBlogForm />
      </Suspense>
    </main>
  );
}

async function NewBlogForm() {
  return <BlogForm tagSuggestions={await getTagNames()} />;
}
