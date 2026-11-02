import type { Metadata } from "next";
import Link from "next/link";
import { blogsPath } from "@/lib/blog-utils";

export const metadata: Metadata = {
  title: "About | BlogCMS",
  description: "What BlogCMS is and what you can read here.",
};

// Edit the text below to tell readers about your blog.
export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-brand-900 text-display">About BlogCMS</h1>
      <p className="text-brand-muted">
        BlogCMS is a place for clear, practical writing on programming, web development, cloud,
        DevOps, cybersecurity and tech careers.
      </p>
      <p className="text-brand-muted">
        Every blog is written and reviewed by our team. Browse by category, search for a topic, or
        see what readers are enjoying this week on the Trending page.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href={blogsPath()}
          className="bg-brand-600 hover:bg-brand-700 text-small rounded-lg px-5 py-3 font-semibold text-white"
        >
          Read the blogs
        </Link>
        <Link
          href="/categories"
          className="border-brand-200 text-brand-900 hover:bg-brand-50 text-small rounded-lg border px-5 py-3 font-semibold"
        >
          Browse categories
        </Link>
      </div>
    </div>
  );
}
