import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

export const metadata: Metadata = { title: "Media | Admin" };

export default function AdminMediaPage() {
  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-8">
      <h1 className="text-brand-900 text-title">Media</h1>
      <p className="text-brand-muted text-small mt-1 mb-6">
        Upload images once and use them in any blog, as a picture or a thumbnail.
      </p>
      <MediaLibrary />
    </main>
  );
}
