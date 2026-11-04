"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Eye, Loader2, Send, Trash2, X } from "lucide-react";
import { BlogEditor } from "@/components/admin/editor/BlogEditor";
import { CategorySelect } from "@/components/admin/categories/CategorySelect";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogThumbnail } from "@/components/public/BlogThumbnail";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ApiError, apiFetch } from "@/lib/api-client";
import { formatDate, readingTime } from "@/lib/blog-utils";
import { slugify } from "@/lib/slugify";
import { useDraft } from "@/lib/use-draft";
import { plainText, SLUG_PATTERN } from "@/lib/validations/blog";
import { StatusBadge } from "./StatusBadge";
import { TagInput } from "./TagInput";

export type BlogFormValues = {
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnail: string;
  categoryId: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
};

export type ExistingBlog = BlogFormValues & {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  updatedAt: string;
};

type Status = "DRAFT" | "PUBLISHED";
type Errors = Partial<Record<keyof BlogFormValues, string>>;

const EMPTY: BlogFormValues = {
  title: "",
  slug: "",
  description: "",
  content: "",
  thumbnail: "",
  categoryId: "",
  tags: [],
  seoTitle: "",
  seoDescription: "",
};

const input =
  "focus:ring-brand-400 text-brand-900 placeholder:text-brand-muted w-full rounded-lg border bg-white px-3.5 py-2.5 text-small outline-none focus:ring-2";
const borderFor = (err?: string) => (err ? "border-red-500" : "border-brand-400");
const card = "border-brand-200 flex flex-col gap-3 rounded-xl border bg-white p-4";
const cardTitle = "text-brand-900 text-small font-semibold";

/** Text fields only, for the local backup (useDraft stores strings). */
const toDraft = (v: BlogFormValues) => ({ ...v, tags: v.tags.join("\n") });

/**
 * Create AND edit form. With `blog` it edits that blog (PUT /api/blogs/:id, same id, same URL
 * unless you change it). Without it, it creates a new one (POST /api/blogs).
 */
export function BlogForm({
  blog,
  tagSuggestions,
}: {
  blog?: ExistingBlog;
  tagSuggestions: string[];
}) {
  const router = useRouter();
  const editing = Boolean(blog);
  const initial = useMemo<BlogFormValues>(
    () => (blog ? { ...EMPTY, ...pickValues(blog) } : EMPTY),
    [blog]
  );

  const [values, setValues] = useState<BlogFormValues>(initial);
  const [saved, setSaved] = useState<BlogFormValues>(initial); // last version in the database
  const [status, setStatus] = useState<Status>(blog?.status ?? "DRAFT");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState<Status | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [preview, setPreview] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(blog?.updatedAt ?? null);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const set = <K extends keyof BlogFormValues>(key: K, value: BlogFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // New blog: the URL follows the title until the admin edits the URL themselves
  function setTitle(title: string) {
    setValues((v) => ({ ...v, title, slug: slugTouched ? v.slug : slugify(title).slice(0, 120) }));
    setErrors((e) => ({ ...e, title: undefined, slug: slugTouched ? e.slug : undefined }));
  }

  // Backup in this browser so a refresh or crash doesn't lose work.
  // Editing: only unsaved changes are backed up, and never older than the saved blog.
  const { clear: clearBackup } = useDraft(
    blog ? `blog-draft:${blog.id}` : "blog-draft:new",
    editing && !dirty ? toDraft(EMPTY) : toDraft(values),
    (d) => {
      setValues({ ...d, tags: d.tags ? d.tags.split("\n").filter(Boolean) : [] });
      if (d.slug) setSlugTouched(true);
    },
    blog ? new Date(blog.updatedAt).getTime() : undefined
  );

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save(nextStatus: Status) {
    // Quick checks here; the server checks everything again
    const local = checkLocally(values, nextStatus);
    if (Object.keys(local).length) {
      setErrors(local);
      toast.error(
        nextStatus === "PUBLISHED"
          ? "A few things are missing before publishing"
          : "Please fix the highlighted fields"
      );
      return;
    }

    setSaving(nextStatus);
    try {
      const body = JSON.stringify({ ...values, status: nextStatus });
      const result = await apiFetch<{
        id: string;
        slug: string;
        status: Status;
        updatedAt?: string;
      }>(blog ? `/api/blogs/${blog.id}` : "/api/blogs", { method: blog ? "PUT" : "POST", body });

      const next = { ...values, slug: result.slug };
      setValues(next);
      setSaved(next);
      setStatus(result.status);
      setErrors({});
      setSlugTouched(true);
      setLastSavedAt(result.updatedAt ?? new Date().toISOString());
      clearBackup();

      const msg =
        nextStatus === "PUBLISHED"
          ? status === "PUBLISHED"
            ? "Blog updated successfully. Changes are live on the website."
            : "Blog published successfully"
          : status === "PUBLISHED"
            ? "Blog moved to drafts (hidden from the website)"
            : blog
              ? "Blog updated successfully"
              : "Blog created successfully (saved as draft)";
      toast.success(msg, {
        action:
          result.status === "PUBLISHED"
            ? { label: "View", onClick: () => window.open(`/blog/${result.slug}`, "_blank") }
            : undefined,
      });

      if (!blog) {
        // Next.js keeps visited pages alive in the background, so empty the "New blog" form;
        // otherwise opening "New blog" again would show (and could re-save) this blog.
        setValues(EMPTY);
        setSaved(EMPTY);
        setStatus("DRAFT");
        setSlugTouched(false);
        setLastSavedAt(null);
        router.replace(`/admin/blogs/${result.id}/edit`);
      }
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const fieldErrors: Errors = {};
        for (const [key, msgs] of Object.entries(err.errors)) {
          if (msgs?.[0]) fieldErrors[key as keyof BlogFormValues] = msgs[0];
        }
        setErrors(fieldErrors);
      }
      toast.error(err instanceof Error ? err.message : "Could not save the blog");
    } finally {
      setSaving(null);
    }
  }

  async function remove() {
    if (!blog) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/blogs/${blog.id}`, { method: "DELETE" });
      clearBackup();
      setSaved(values); // nothing left to warn about
      toast.success("Blog deleted successfully");
      router.replace("/admin/blogs");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the blog");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  // Ctrl/Cmd + S saves (keeps the current status)
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current(status);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  const busy = saving !== null || deleting;
  const published = status === "PUBLISHED";
  const slugChangedOnLiveBlog = editing && published && values.slug !== saved.slug;

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin/blogs"
            aria-label="Back to all blogs"
            className="border-brand-200 text-brand-900 hover:bg-brand-50 flex size-10 shrink-0 items-center justify-center rounded-lg border bg-white"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-brand-900 text-title truncate">
              {editing ? "Edit blog" : "New blog"}
            </h1>
            <p className="text-brand-muted text-caption flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              {dirty ? (
                <span className="font-semibold text-amber-700 dark:text-amber-300">
                  Unsaved changes
                </span>
              ) : lastSavedAt ? (
                <span>Saved {formatDate(lastSavedAt)}</span>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="border-brand-200 text-brand-900 hover:bg-brand-50 text-small inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-4 font-medium"
          >
            <Eye className="size-4" /> See as published blog
          </button>
          {editing && published && (
            <a
              href={`/blog/${saved.slug}`}
              target="_blank"
              rel="noreferrer"
              className="border-brand-200 text-brand-900 hover:bg-brand-50 text-small inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-4 font-medium"
            >
              <ExternalLink className="size-4" /> Open live page
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="blog-title" className="sr-only">
              Title
            </label>
            <input
              id="blog-title"
              value={values.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog title"
              maxLength={150}
              className={`${input} ${borderFor(errors.title)} text-heading py-3`}
            />
            {errors.title && <FieldError text={errors.title} />}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="blog-description" className="text-brand-900 text-small font-medium">
              Short description
            </label>
            <textarea
              id="blog-description"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="One or two sentences shown on blog cards and in search results."
              className={`${input} ${borderFor(errors.description)} resize-y`}
            />
            <div className="flex justify-between gap-3">
              {errors.description ? <FieldError text={errors.description} /> : <span />}
              <span className="text-caption text-brand-muted tabular-nums">
                {values.description.length}/300
              </span>
            </div>
          </div>

          <BlogEditor
            value={values.content}
            onChange={(html) => set("content", html)}
            error={errors.content}
            exportTitle={values.title}
            onImport={({ title, description }) => {
              if (title && !values.title) setTitle(title);
              if (description && !values.description) set("description", description);
            }}
          />
        </div>

        {/* Side column */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <section className={card}>
            <h2 className={cardTitle}>{published ? "Live on the website" : "Not published yet"}</h2>
            <p className="text-caption text-brand-muted">
              {published
                ? `Published${blog?.publishedAt ? ` ${formatDate(blog.publishedAt)}` : ""}. "Update" puts your changes live; the URL stays the same.`
                : "Drafts are only visible in the admin panel."}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => save("PUBLISHED")}
                disabled={busy}
                className="bg-brand-600 hover:bg-brand-700 text-small flex h-10 items-center justify-center gap-2 rounded-lg font-semibold text-white disabled:opacity-50"
              >
                {saving === "PUBLISHED" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {published ? "Update" : "Publish"}
              </button>
              <button
                type="button"
                onClick={() => save("DRAFT")}
                disabled={busy}
                className="border-brand-400 text-brand-900 hover:bg-brand-50 text-small flex h-10 items-center justify-center gap-2 rounded-lg border bg-white font-medium disabled:opacity-50"
              >
                {saving === "DRAFT" && <Loader2 className="size-4 animate-spin" />}
                {published ? "Unpublish (move to drafts)" : "Save draft"}
              </button>
            </div>
            <p className="text-caption text-brand-muted">Tip: Ctrl/⌘ + S saves.</p>
          </section>

          <section className={card}>
            <h2 className={cardTitle}>URL</h2>
            <div
              className={`focus-within:ring-brand-400 flex items-center rounded-lg border bg-white focus-within:ring-2 ${borderFor(errors.slug)}`}
            >
              <span className="text-brand-muted text-caption shrink-0 pl-3">/blog/</span>
              <input
                aria-label="URL slug"
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                onBlur={() => set("slug", slugify(values.slug).slice(0, 120))}
                placeholder="made-from-the-title"
                className="text-brand-900 placeholder:text-brand-muted text-small min-w-0 flex-1 bg-transparent py-2.5 pr-3 outline-none"
              />
            </div>
            {errors.slug ? (
              <FieldError text={errors.slug} />
            ) : slugChangedOnLiveBlog ? (
              <p className="text-caption text-amber-700 dark:text-amber-300">
                This blog is live. Changing the URL breaks links people already shared.
              </p>
            ) : (
              <p className="text-caption text-brand-muted">
                {editing
                  ? "Stays the same unless you change it."
                  : "Made from the title. You can edit it."}
              </p>
            )}
          </section>

          <section className={card}>
            <CategorySelect
              value={values.categoryId}
              onChange={(id) => set("categoryId", id)}
              error={errors.categoryId}
            />
          </section>

          <section className={card}>
            <h2 className={cardTitle}>Tags</h2>
            <TagInput
              value={values.tags}
              onChange={(tags) => set("tags", tags)}
              suggestions={tagSuggestions}
              error={errors.tags}
            />
          </section>

          <section className={card}>
            <ImagePicker
              label="Featured image (thumbnail)"
              value={values.thumbnail || null}
              onChange={(url) => set("thumbnail", url ?? "")}
              error={errors.thumbnail}
            />
          </section>

          <section className={card}>
            <h2 className={cardTitle}>SEO (search engines)</h2>
            <label className="flex flex-col gap-1.5">
              <span className="text-caption text-brand-muted">Title in Google (optional)</span>
              <input
                value={values.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                maxLength={70}
                placeholder={values.title || "Uses the blog title"}
                className={`${input} ${borderFor(errors.seoTitle)}`}
              />
              <span className="text-caption text-brand-muted self-end tabular-nums">
                {values.seoTitle.length}/70
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-caption text-brand-muted">
                Description in Google (optional)
              </span>
              <textarea
                value={values.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                maxLength={160}
                rows={3}
                placeholder={values.description || "Uses the short description"}
                className={`${input} ${borderFor(errors.seoDescription)} resize-y`}
              />
              <span className="text-caption text-brand-muted self-end tabular-nums">
                {values.seoDescription.length}/160
              </span>
            </label>
            <div className="bg-brand-50 rounded-lg p-3">
              <p className="text-caption text-brand-muted">Search result preview</p>
              <p className="text-small mt-1 truncate font-medium text-blue-700 dark:text-blue-300">
                {values.seoTitle || values.title || "Blog title"} | BlogCMS
              </p>
              <p className="text-caption truncate text-green-700 dark:text-green-400">
                /blog/{values.slug || "your-url"}
              </p>
              <p className="text-caption text-brand-muted line-clamp-2">
                {values.seoDescription ||
                  values.description ||
                  "Your short description appears here."}
              </p>
            </div>
          </section>

          {editing && (
            <section className={`${card} border-red-200 dark:border-red-900`}>
              <h2 className={cardTitle}>Danger zone</h2>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={busy}
                className="text-small flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <Trash2 className="size-4" /> Delete this blog
              </button>
            </section>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Are you sure you want to delete this blog?"
        description={`"${values.title || "This blog"}" will be removed from the website and the admin panel. This can't be undone.`}
        confirmLabel="Delete blog"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />

      {preview && <Preview values={values} onClose={() => setPreview(false)} />}
    </div>
  );
}

function pickValues(b: ExistingBlog): BlogFormValues {
  return {
    title: b.title,
    slug: b.slug,
    description: b.description,
    content: b.content,
    thumbnail: b.thumbnail,
    categoryId: b.categoryId,
    tags: b.tags,
    seoTitle: b.seoTitle,
    seoDescription: b.seoDescription,
  };
}

function checkLocally(v: BlogFormValues, status: Status): Errors {
  const e: Errors = {};
  if (!v.title.trim()) e.title = "Title is required";
  else if (v.title.trim().length < 5) e.title = "Title must be at least 5 characters";
  if (!v.description.trim()) e.description = "Description is required";
  if (v.slug && !SLUG_PATTERN.test(v.slug))
    e.slug = "Use only lowercase letters, numbers and hyphens";
  if (status === "PUBLISHED") {
    if (!e.description && v.description.trim().length < 10)
      e.description = "Add a description (at least 10 characters) before publishing";
    if (!plainText(v.content) && !/<img\b/i.test(v.content))
      e.content = "Write some content before publishing";
    if (!v.thumbnail) e.thumbnail = "Add a thumbnail before publishing";
  }
  return e;
}

function FieldError({ text }: { text: string }) {
  return (
    <p role="alert" className="text-caption text-red-600 dark:text-red-400">
      {text}
    </p>
  );
}

/** Full-screen "how readers will see it", using the same components as the public blog page. */
function Preview({ values, onClose }: { values: BlogFormValues; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Blog preview"
      className="fixed inset-0 z-50 overflow-y-auto bg-white"
    >
      <div className="border-brand-200 bg-brand-100 text-brand-900 text-caption sticky top-0 z-10 flex items-center justify-center gap-3 border-b px-4 py-2">
        Preview: this is how readers will see the blog
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 font-semibold underline"
        >
          <X className="size-3.5" /> Close
        </button>
      </div>
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <header className="flex flex-col gap-4">
          <h1 className="text-brand-900 text-display">{values.title || "Untitled blog"}</h1>
          {values.description && <p className="text-brand-muted text-body">{values.description}</p>}
          <p className="text-brand-muted text-small">
            {formatDate(new Date())} · {readingTime(values.content)} min read
          </p>
        </header>
        {values.thumbnail && (
          <BlogThumbnail
            src={values.thumbnail}
            title={values.title}
            eager
            className="aspect-[16/10] w-full rounded-2xl"
          />
        )}
        {plainText(values.content) || /<img\b/i.test(values.content) ? (
          <BlogContent html={values.content} />
        ) : (
          <p className="text-brand-muted">Nothing written yet.</p>
        )}
        {values.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {values.tags.map((t) => (
              <li
                key={t}
                className="bg-brand-50 border-brand-200 text-brand-900 text-small rounded-full border px-3 py-1.5 font-medium"
              >
                #{t}
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}
