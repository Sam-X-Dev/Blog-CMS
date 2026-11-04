import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink } from "lucide-react";
import { DeleteCommentButton } from "@/components/admin/comments/DeleteCommentButton";
import { formatDate } from "@/lib/blog-utils";
import { getAdminComments } from "@/lib/queries/comments";

export const metadata: Metadata = { title: "Comments | Admin" };

export default function AdminCommentsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-8">
      <h1 className="text-brand-900 text-title">Comments</h1>
      <p className="text-brand-muted text-small mt-1 mb-6">
        What readers are saying, newest first. Delete anything rude, spam or off-topic.
      </p>
      <Suspense fallback={<div className="bg-brand-50 h-64 animate-pulse rounded-xl" />}>
        <CommentList />
      </Suspense>
    </main>
  );
}

async function CommentList() {
  const comments = await getAdminComments();
  if (comments.length === 0) {
    return (
      <p className="border-brand-200 text-brand-muted text-small rounded-xl border border-dashed bg-white p-10 text-center">
        No comments yet. They will show up here when readers comment on a blog.
      </p>
    );
  }

  return (
    <ul className="border-brand-200 divide-brand-200 divide-y overflow-hidden rounded-xl border bg-white">
      {comments.map((c) => (
        <li key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:p-5">
          <div className="min-w-0 flex-1">
            <p className="text-small text-brand-muted flex flex-wrap items-center gap-x-2">
              <span className="text-brand-900 font-semibold">{c.user.name}</span>
              <span className="truncate">{c.user.email}</span>
              <span aria-hidden>·</span>
              <span>{formatDate(c.createdAt)}</span>
            </p>
            <p className="text-small text-brand-900 mt-1.5 break-words whitespace-pre-line">
              {c.content}
            </p>
            <Link
              href={`/blog/${c.blog.slug}#comments`}
              target="_blank"
              className="text-caption text-brand-600 mt-2 inline-flex items-center gap-1 font-semibold hover:underline"
            >
              On: {c.blog.title} <ExternalLink className="size-3" aria-hidden />
            </Link>
          </div>
          <DeleteCommentButton id={c.id} author={c.user.name} />
        </li>
      ))}
    </ul>
  );
}
