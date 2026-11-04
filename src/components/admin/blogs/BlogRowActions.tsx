"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, EyeOff, Loader2, Pencil, Send, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const btn =
  "text-small inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 font-medium transition-colors disabled:opacity-50";
const neutral = `${btn} border-brand-200 text-brand-900 bg-white hover:bg-brand-50`;

/** Edit · View · Publish/Unpublish · Delete for one blog in the list. */
export function BlogRowActions({
  id,
  title,
  slug,
  status,
}: {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"status" | "delete" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const published = status === "PUBLISHED";

  async function toggleStatus() {
    setBusy("status");
    try {
      await apiFetch(`/api/blogs/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: published ? "DRAFT" : "PUBLISHED" }),
      });
      toast.success(published ? "Blog moved to drafts" : "Blog published successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change the status");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("delete");
    try {
      await apiFetch(`/api/blogs/${id}`, { method: "DELETE" });
      toast.success("Blog deleted successfully");
      setConfirming(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the blog");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Link
        href={`/admin/blogs/${id}/edit`}
        className={`${btn} bg-brand-600 hover:bg-brand-700 border-transparent text-white`}
      >
        <Pencil className="size-3.5" /> Edit
      </Link>
      {published && (
        <a
          href={`/blog/${slug}`}
          target="_blank"
          rel="noreferrer"
          className={neutral}
          aria-label={`View "${title}" on the website`}
        >
          <ExternalLink className="size-3.5" /> View
        </a>
      )}
      <button type="button" onClick={toggleStatus} disabled={busy !== null} className={neutral}>
        {busy === "status" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : published ? (
          <EyeOff className="size-3.5" />
        ) : (
          <Send className="size-3.5" />
        )}
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={busy !== null}
        aria-label={`Delete "${title}"`}
        className={`${btn} border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40`}
      >
        <Trash2 className="size-3.5" />
        <span className="sm:sr-only lg:not-sr-only">Delete</span>
      </button>

      <ConfirmDialog
        open={confirming}
        title="Are you sure you want to delete this blog?"
        description={`"${title}" will be removed from the website and the admin panel. This can't be undone.`}
        confirmLabel="Delete blog"
        loading={busy === "delete"}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
