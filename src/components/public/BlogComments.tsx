"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiFetch } from "@/lib/api-client";
import { loginHref, useCurrentUser } from "@/lib/use-current-user";
import { COMMENTS_CHANGED } from "./BlogActions";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string };
  mine: boolean;
};

const MAX = 1000;

function when(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/** Comments under a blog. Everyone can read them; logged-in readers can write and delete their own. */
export function BlogComments({ blogId }: { blogId: string }) {
  const { status, user } = useCurrentUser();
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [error, setError] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load again when the reader logs in or out, so "delete" shows on their own comments
  useEffect(() => {
    if (status === "loading") return;
    apiFetch<Comment[]>(`/api/comments?blogId=${encodeURIComponent(blogId)}`)
      .then((c) => {
        setComments(c);
        setError(false);
      })
      .catch(() => setError(true));
  }, [blogId, status]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (content.length < 2) {
      toast.error("Write a little more before posting");
      return;
    }
    setPosting(true);
    try {
      const comment = await apiFetch<Comment>("/api/comments", {
        method: "POST",
        body: JSON.stringify({ blogId, content }),
      });
      setComments((c) => [comment, ...(c ?? [])]);
      setText("");
      window.dispatchEvent(new CustomEvent(COMMENTS_CHANGED, { detail: 1 }));
      toast.success("Comment posted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not post your comment");
    } finally {
      setPosting(false);
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    try {
      await apiFetch(`/api/comments/${id}`, { method: "DELETE" });
      setComments((c) => (c ?? []).filter((x) => x.id !== id));
      window.dispatchEvent(new CustomEvent(COMMENTS_CHANGED, { detail: -1 }));
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete the comment");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section id="comments" className="flex scroll-mt-24 flex-col gap-5">
      <h2 className="text-brand-900 text-title">
        Comments{comments && comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {status === "in" && user ? (
        <form onSubmit={post} className="flex flex-col gap-2">
          <div className="flex gap-3">
            <Avatar name={user.name} />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              placeholder="Share your thoughts..."
              rows={3}
              aria-label="Write a comment"
              className="border-brand-400 focus:ring-brand-400 text-brand-900 placeholder:text-brand-muted text-small w-full resize-y rounded-xl border bg-white px-3.5 py-2.5 outline-none focus:ring-2"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <span className="text-caption text-brand-muted tabular-nums">
              {text.length}/{MAX}
            </span>
            <button
              type="submit"
              disabled={posting || text.trim().length < 2}
              className="bg-brand-600 hover:bg-brand-700 text-small flex h-10 items-center gap-2 rounded-lg px-4 font-semibold text-white disabled:opacity-50"
            >
              {posting && <Loader2 className="size-4 animate-spin" />}
              {posting ? "Posting..." : "Post comment"}
            </button>
          </div>
        </form>
      ) : status === "out" ? (
        <div className="border-brand-200 bg-brand-50 text-small text-brand-muted flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <span>Log in to join the conversation.</span>
          <span className="flex gap-2">
            <Link
              href={loginHref()}
              className="bg-brand-600 hover:bg-brand-700 rounded-lg px-3.5 py-2 font-semibold text-white"
            >
              Log in
            </Link>
            <Link
              href={`/signup?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
              className="border-brand-200 text-brand-900 rounded-lg border px-3.5 py-2 font-semibold hover:bg-white"
            >
              Sign up
            </Link>
          </span>
        </div>
      ) : null}

      {error ? (
        <p className="text-small text-brand-muted">
          Comments could not be loaded. Refresh to try again.
        </p>
      ) : comments === null ? (
        <div className="bg-brand-50 h-24 animate-pulse rounded-xl" aria-label="Loading comments" />
      ) : comments.length === 0 ? (
        <p className="text-small text-brand-muted">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar name={c.user.name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-small text-brand-900 font-semibold">{c.user.name}</span>
                  <span className="text-caption text-brand-muted">{when(c.createdAt)}</span>
                  {c.mine && (
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      disabled={deleting === c.id}
                      className="text-caption ml-auto inline-flex items-center gap-1 text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
                    >
                      <Trash2 className="size-3.5" aria-hidden /> Delete
                    </button>
                  )}
                </div>
                <p className="text-small text-brand-900 mt-1 break-words whitespace-pre-line">
                  {c.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="bg-brand-100 text-brand-900 text-small flex size-9 shrink-0 items-center justify-center rounded-full font-semibold"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
