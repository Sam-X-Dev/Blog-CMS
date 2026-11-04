"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiFetch } from "@/lib/api-client";
import { loginHref, useCurrentUser } from "@/lib/use-current-user";

type Engagement = { likes: number; comments: number; liked: boolean; saved: boolean };

/** Fired by the comments section so the count here stays right */
export const COMMENTS_CHANGED = "blogcms:comments-changed";

const pill =
  "border-brand-200 text-brand-900 hover:bg-brand-50 text-small inline-flex h-9 items-center gap-2 rounded-full border bg-white px-3.5 font-medium transition-colors disabled:opacity-60";

/** Like, comment count and Save, under the blog title. Needs a reader account to like or save. */
export function BlogActions({ blogId }: { blogId: string }) {
  const router = useRouter();
  const { status } = useCurrentUser();
  const [data, setData] = useState<Engagement | null>(null);
  const [busy, setBusy] = useState<"like" | "save" | null>(null);

  const load = useCallback(() => {
    apiFetch<Engagement>(`/api/engagement/${blogId}`)
      .then(setData)
      .catch(() => setData({ likes: 0, comments: 0, liked: false, saved: false }));
  }, [blogId]);

  // Load again when the reader logs in or out, so "liked" and "saved" are theirs
  useEffect(() => {
    if (status !== "loading") load();
  }, [status, load]);

  useEffect(() => {
    const onChange = (e: Event) => {
      const delta = (e as CustomEvent<number>).detail;
      setData((d) => (d ? { ...d, comments: Math.max(0, d.comments + delta) } : d));
    };
    window.addEventListener(COMMENTS_CHANGED, onChange);
    return () => window.removeEventListener(COMMENTS_CHANGED, onChange);
  }, []);

  function needLogin(action: string) {
    toast(`Log in to ${action}`, {
      action: { label: "Log in", onClick: () => router.push(loginHref()) },
    });
  }

  async function toggleLike() {
    if (!data) return;
    if (status !== "in") return needLogin("like blogs");
    setBusy("like");
    // Show the change straight away, undo it if the server says no
    const before = data;
    setData({ ...data, liked: !data.liked, likes: data.likes + (data.liked ? -1 : 1) });
    try {
      const res = await apiFetch<{ liked: boolean; likes: number }>(`/api/me/likes/${blogId}`, {
        method: data.liked ? "DELETE" : "PUT",
      });
      setData((d) => (d ? { ...d, ...res } : d));
    } catch (err) {
      setData(before);
      toast.error(err instanceof ApiError ? err.message : "Could not update your like");
    } finally {
      setBusy(null);
    }
  }

  async function toggleSave() {
    if (!data) return;
    if (status !== "in") return needLogin("save blogs");
    setBusy("save");
    try {
      const res = await apiFetch<{ saved: boolean }>(`/api/me/saved/${blogId}`, {
        method: data.saved ? "DELETE" : "PUT",
      });
      setData((d) => (d ? { ...d, saved: res.saved } : d));
      toast.success(res.saved ? "Saved. Find it under Saved blogs." : "Removed from saved blogs");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update saved blogs");
    } finally {
      setBusy(null);
    }
  }

  if (!data) return <div className="bg-brand-50 h-9 w-64 animate-pulse rounded-full" />;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleLike}
        disabled={busy === "like"}
        aria-pressed={data.liked}
        aria-label={data.liked ? "Unlike this blog" : "Like this blog"}
        className={`${pill} ${data.liked ? "border-red-200 text-red-600 dark:border-red-900/60 dark:text-red-400" : ""}`}
      >
        <Heart className={`size-4 ${data.liked ? "fill-current" : ""}`} aria-hidden />
        {data.likes} {data.likes === 1 ? "like" : "likes"}
      </button>
      <a href="#comments" className={pill}>
        <MessageCircle className="size-4" aria-hidden />
        {data.comments} {data.comments === 1 ? "comment" : "comments"}
      </a>
      <button
        type="button"
        onClick={toggleSave}
        disabled={busy === "save"}
        aria-pressed={data.saved}
        className={`${pill} ${data.saved ? "bg-brand-100 border-brand-400" : ""}`}
      >
        <Bookmark className={`size-4 ${data.saved ? "fill-current" : ""}`} aria-hidden />
        {data.saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
