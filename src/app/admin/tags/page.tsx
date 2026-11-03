import type { Metadata } from "next";
import { TagManager } from "@/components/admin/tags/TagManager";

export const metadata: Metadata = { title: "Tags | Admin" };

export default function AdminTagsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-8">
      <h1 className="text-brand-900 text-title">Tags</h1>
      <p className="text-brand-muted text-small mt-1 mb-6">
        Tags help readers find related blogs. Add them here or while writing a blog.
      </p>
      <TagManager />
    </main>
  );
}
