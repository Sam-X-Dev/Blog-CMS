"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ApiError, apiFetch } from "@/lib/api-client";

export function DeleteCommentButton({ id, author }: { id: string; author: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      await apiFetch(`/api/comments/${id}`, { method: "DELETE" });
      toast.success("Comment deleted");
      setConfirm(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete the comment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="text-small inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 font-medium text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        <Trash2 className="size-4" /> Delete
      </button>
      <ConfirmDialog
        open={confirm}
        title="Delete this comment?"
        description={`The comment by ${author} will be removed from the website. This can't be undone.`}
        confirmLabel="Delete"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
