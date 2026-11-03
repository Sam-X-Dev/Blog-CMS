"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { ApiError, apiFetch } from "@/lib/api-client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Tag = { id: string; name: string; slug: string; _count: { blogs: number } };

const input =
  "border-brand-400 focus:ring-brand-400 text-brand-900 placeholder:text-brand-muted text-small rounded-lg border bg-white px-3.5 py-2.5 outline-none focus:ring-2";
const iconBtn =
  "text-brand-muted hover:text-brand-900 hover:bg-brand-50 flex size-9 items-center justify-center rounded-lg disabled:opacity-50";

/** Add, rename and delete tags. Deleting a tag keeps the blogs; they just lose that tag. */
export function TagManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [toDelete, setToDelete] = useState<Tag | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setTags(await apiFetch<Tag[]>("/api/tags"));
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load tags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Run after the first render (avoids a state update inside the effect body)
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      await apiFetch("/api/tags", { method: "POST", body: JSON.stringify({ name: name.trim() }) });
      toast.success(`Tag "${name.trim()}" added`);
      setName("");
      await load();
    } catch (err) {
      setAddError(
        err instanceof ApiError ? (err.errors?.name?.[0] ?? err.message) : "Could not add the tag"
      );
    } finally {
      setAdding(false);
    }
  }

  async function rename() {
    if (!editing?.name.trim()) return;
    setSavingEdit(true);
    try {
      await apiFetch(`/api/tags/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editing.name.trim() }),
      });
      toast.success("Tag renamed");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? (err.errors?.name?.[0] ?? err.message)
          : "Could not rename the tag"
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function remove() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/tags/${toDelete.id}`, { method: "DELETE" });
      toast.success(`Tag "${toDelete.name}" deleted`);
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the tag");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={add}
        className="border-brand-200 flex flex-col gap-2 rounded-xl border bg-white p-5"
      >
        <label htmlFor="new-tag" className="text-brand-900 text-small font-semibold">
          Add a tag
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="new-tag"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setAddError(null);
            }}
            maxLength={40}
            placeholder="e.g. React"
            className={`${input} flex-1`}
          />
          <button
            type="submit"
            disabled={adding || !name.trim()}
            className="bg-brand-600 hover:bg-brand-700 text-small inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 font-semibold text-white disabled:opacity-50"
          >
            {adding && <Loader2 className="size-4 animate-spin" />} Add tag
          </button>
        </div>
        {addError && <p className="text-caption text-red-600 dark:text-red-400">{addError}</p>}
      </form>

      <section className="border-brand-200 overflow-hidden rounded-xl border bg-white">
        <h2 className="text-brand-900 text-small border-brand-200 border-b px-5 py-4 font-semibold">
          All tags{" "}
          {!loading && !loadError && (
            <span className="text-brand-muted font-normal">({tags.length})</span>
          )}
        </h2>
        {loading ? (
          <p className="text-brand-muted text-small p-10 text-center">Loading tags...</p>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-small text-red-600 dark:text-red-400">{loadError}</p>
            <button
              type="button"
              onClick={load}
              className="text-brand-600 text-small font-semibold hover:underline"
            >
              Try again
            </button>
          </div>
        ) : tags.length === 0 ? (
          <p className="text-brand-muted text-small p-10 text-center">No tags yet.</p>
        ) : (
          <ul className="divide-brand-200 divide-y">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center justify-between gap-3 px-5 py-3">
                {editing?.id === tag.id ? (
                  <form
                    className="flex flex-1 items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      rename();
                    }}
                  >
                    <input
                      autoFocus
                      value={editing.name}
                      maxLength={40}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
                      aria-label="New tag name"
                      className={`${input} flex-1 py-2`}
                    />
                    <button
                      type="submit"
                      disabled={savingEdit}
                      aria-label="Save"
                      className={iconBtn}
                    >
                      {savingEdit ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      aria-label="Cancel"
                      className={iconBtn}
                    >
                      <X className="size-4" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="text-brand-900 text-small font-medium">#{tag.name}</p>
                      <p className="text-brand-muted text-caption">
                        {tag._count.blogs} {tag._count.blogs === 1 ? "blog" : "blogs"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing({ id: tag.id, name: tag.name })}
                        aria-label={`Rename ${tag.name}`}
                        className={iconBtn}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(tag)}
                        aria-label={`Delete ${tag.name}`}
                        className={`${iconBtn} hover:text-red-600`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this tag?"
        description={
          toDelete
            ? `"${toDelete.name}" will be removed from ${toDelete._count.blogs} ${toDelete._count.blogs === 1 ? "blog" : "blogs"}. The blogs themselves stay.`
            : undefined
        }
        confirmLabel="Delete tag"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
