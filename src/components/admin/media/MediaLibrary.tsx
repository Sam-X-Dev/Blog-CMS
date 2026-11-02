"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ExternalLink, ImageUp, Link2, Loader2, RotateCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiFetch } from "@/lib/api-client";
import { cldUrl } from "@/lib/cloudinary-url";
import {
  checkImageFile,
  formatBytes,
  IMAGE_ACCEPT,
  MAX_IMAGE_MB,
  uploadImage,
} from "@/lib/media-upload";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { MediaItem, MediaPage } from "@/types/media";

type Upload = { key: string; name: string; progress: number; error?: string };

type MediaLibraryProps = {
  /** "manage" = the Media page (copy link, delete). "pick" = choosing one image for a blog. */
  mode?: "manage" | "pick";
  /** pick mode: called with the chosen (or freshly uploaded) image */
  onPick?: (item: MediaItem) => void;
};

const iconButton =
  "text-brand-muted hover:text-brand-900 hover:bg-brand-50 flex size-8 items-center justify-center rounded-md transition-colors";

/** Upload area + grid of every uploaded image, newest first. */
export function MediaLibrary({ mode = "manage", onPick }: MediaLibraryProps) {
  const picking = mode === "pick";

  // List
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Upload
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Delete
  const [toDelete, setToDelete] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // State is set only inside the promise callbacks (React 19 effect rule)
  const loadPage = useCallback(
    (n: number) =>
      apiFetch<MediaPage>(`/api/media?page=${n}`)
        .then((data) => {
          setItems((prev) => (n === 1 ? data.items : [...prev, ...data.items]));
          setPage(data.page);
          setTotalPages(data.totalPages);
          setTotal(data.total);
          setLoadError(null);
        })
        .catch((err: unknown) =>
          setLoadError(err instanceof Error ? err.message : "Failed to load images"),
        )
        .finally(() => {
          setLoading(false);
          setLoadingMore(false);
        }),
    [],
  );

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  function retry() {
    setLoading(true);
    loadPage(1);
  }

  function loadMore() {
    setLoadingMore(true);
    loadPage(page + 1);
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    // Choosing a thumbnail: one image is enough
    const queue = picking ? files.slice(0, 1) : files;
    let uploaded = 0;

    for (const file of queue) {
      const key = `${file.name}-${file.size}-${Date.now()}`;
      const problem = checkImageFile(file);
      setUploads((u) => [...u, { key, name: file.name, progress: 0, error: problem ?? undefined }]);
      if (problem) continue;

      try {
        const item = await uploadImage(file, (progress) =>
          setUploads((u) => u.map((x) => (x.key === key ? { ...x, progress } : x))),
        );
        setUploads((u) => u.filter((x) => x.key !== key));
        setItems((prev) => [item, ...prev.filter((p) => p.id !== item.id)]);
        setTotal((t) => t + 1);
        uploaded += 1;
        if (picking) {
          onPick?.(item);
          return;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setUploads((u) => u.map((x) => (x.key === key ? { ...x, error: message } : x)));
      }
    }
    if (!picking && uploaded > 0) {
      toast.success(uploaded === 1 ? "Image uploaded" : `${uploaded} images uploaded`);
    }
  }

  async function copyLink(item: MediaItem) {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId((id) => (id === item.id ? null : id)), 1500);
    } catch {
      toast.error("Couldn't copy. Open the image and copy the link from the address bar.");
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/media/${toDelete.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((p) => p.id !== toDelete.id));
      setTotal((t) => t - 1);
      toast.success("Image deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete the image");
      if (err instanceof ApiError && err.status === 409) setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Upload area: click or drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragging ? "border-brand-400 bg-brand-50" : "border-brand-200 bg-white"
        }`}
      >
        <ImageUp className="text-brand-400 size-8" strokeWidth={1.5} aria-hidden />
        <p className="text-brand-900 text-body">
          Drag {picking ? "an image" : "images"} here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-brand-600 font-semibold underline-offset-4 hover:underline"
          >
            choose {picking ? "a file" : "files"}
          </button>
        </p>
        <p className="text-brand-muted text-caption">
          JPG, PNG, WebP, GIF or AVIF · up to {MAX_IMAGE_MB} MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple={!picking}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = ""; // allow choosing the same file again
          }}
        />
      </div>

      {/* Uploads in progress (and failed ones, until dismissed) */}
      {uploads.length > 0 && (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {uploads.map((u) => (
            <li
              key={u.key}
              className="border-brand-200 text-small flex items-center gap-3 rounded-lg border bg-white px-4 py-3"
            >
              <span className="text-brand-900 min-w-0 flex-1 truncate">{u.name}</span>
              {u.error ? (
                <>
                  <span className="text-caption text-red-600">{u.error}</span>
                  <button
                    type="button"
                    onClick={() => setUploads((list) => list.filter((x) => x.key !== u.key))}
                    className="text-brand-muted hover:text-brand-900 text-caption font-medium"
                  >
                    Dismiss
                  </button>
                </>
              ) : (
                <>
                  <span className="bg-brand-100 h-1.5 w-32 overflow-hidden rounded-full">
                    <span
                      className="bg-brand-600 block h-full rounded-full transition-[width]"
                      style={{ width: `${u.progress}%` }}
                    />
                  </span>
                  <span className="text-brand-muted text-caption w-9 text-right tabular-nums">
                    {u.progress}%
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Library */}
      {loading ? (
        <TileGrid>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-brand-50 aspect-square animate-pulse rounded-lg" />
          ))}
        </TileGrid>
      ) : loadError ? (
        <div className="border-brand-200 bg-brand-50 flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
          <p className="text-brand-900 text-body">{loadError}</p>
          <button
            type="button"
            onClick={retry}
            className="text-brand-600 text-small inline-flex items-center gap-1.5 font-semibold hover:underline"
          >
            <RotateCw className="size-4" aria-hidden /> Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="border-brand-200 bg-brand-50 text-brand-muted rounded-xl border border-dashed px-6 py-10 text-center">
          No images yet. Upload your first one above.
        </p>
      ) : (
        <>
          <p className="text-brand-muted text-small">
            {total.toLocaleString("en-IN")} {total === 1 ? "image" : "images"}
            {picking && " · click one to use it"}
          </p>

          <TileGrid>
            {items.map((item) => {
              const image = (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cldUrl(item.url, 400)}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              );
              const details = [
                item.width && item.height ? `${item.width} × ${item.height}` : null,
                formatBytes(item.bytes),
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <figure key={item.id} className="group flex flex-col gap-2">
                  {picking ? (
                    <button
                      type="button"
                      onClick={() => onPick?.(item)}
                      aria-label={`Use image ${details}`}
                      className="border-brand-200 hover:ring-brand-400 bg-brand-50 aspect-square overflow-hidden rounded-lg border transition-shadow hover:ring-2"
                    >
                      {image}
                    </button>
                  ) : (
                    <div className="border-brand-200 bg-brand-50 aspect-square overflow-hidden rounded-lg border">
                      {image}
                    </div>
                  )}

                  <figcaption className="flex items-center justify-between gap-2">
                    <span className="text-brand-muted text-caption truncate">{details}</span>
                    {!picking && (
                      <span className="-mr-1.5 flex shrink-0">
                        <button
                          type="button"
                          onClick={() => copyLink(item)}
                          title="Copy link"
                          aria-label="Copy link"
                          className={iconButton}
                        >
                          {copiedId === item.id ? (
                            <Check className="size-4 text-green-700" />
                          ) : (
                            <Link2 className="size-4" />
                          )}
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open full size"
                          aria-label="Open full size"
                          className={iconButton}
                        >
                          <ExternalLink className="size-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setToDelete(item)}
                          title="Delete"
                          aria-label="Delete"
                          className={`${iconButton} hover:text-red-700`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </span>
                    )}
                  </figcaption>
                </figure>
              );
            })}
          </TileGrid>

          {page < totalPages && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="border-brand-400 text-brand-900 hover:bg-brand-50 text-small inline-flex min-h-11 items-center gap-2 rounded-lg border px-5 font-medium disabled:opacity-60"
              >
                {loadingMore && <Loader2 className="size-4 animate-spin" />}
                Load more
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this image?"
        description="It will be removed from Cloudinary for good. Images used in a blog can't be deleted."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function TileGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{children}</div>;
}
