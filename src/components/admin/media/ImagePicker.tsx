"use client";

import { useRef, useState } from "react";
import { Images, Loader2, Trash2, Upload } from "lucide-react";
import { cldUrl } from "@/lib/cloudinary-url";
import { IMAGE_ACCEPT, MAX_IMAGE_MB, uploadImage } from "@/lib/media-upload";
import { MediaPickerDialog } from "./MediaPickerDialog";

type ImagePickerProps = {
  /** Current image link, or null/"" when there is none */
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  error?: string;
};

const secondaryBtn =
  "border-brand-200 text-brand-900 hover:bg-brand-50 text-small inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 font-medium disabled:opacity-60";

/**
 * Blog thumbnail field: upload from the computer (click or drop) or choose from the Media library.
 *
 * Usage in the blog form (Samarth):
 *   <ImagePicker value={thumbnail} onChange={setThumbnail} error={errors.thumbnail} />
 */
export function ImagePicker({
  value,
  onChange,
  label = "Thumbnail",
  hint = `Shown on blog cards and when the link is shared. Best size 1200 × 750. Up to ${MAX_IMAGE_MB} MB.`,
  error,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const uploading = progress !== null;

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setProgress(0);
    try {
      const item = await uploadImage(file, setProgress);
      onChange(item.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  }

  const message = uploadError ?? error;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-brand-900 text-small font-medium">{label}</span>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files[0]);
        }}
        className={`relative aspect-[16/10] w-full max-w-md overflow-hidden rounded-xl border-2 transition-colors ${
          value ? "border-solid" : "border-dashed"
        } ${message ? "border-red-400" : dragging ? "border-brand-400" : "border-brand-200"} ${
          dragging ? "bg-brand-50" : "bg-white"
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cldUrl(value, 800)} alt="" className="size-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-brand-muted hover:text-brand-900 flex size-full flex-col items-center justify-center gap-2"
          >
            <Upload className="text-brand-400 size-7" strokeWidth={1.5} aria-hidden />
            <span className="text-small font-medium">Click or drop an image</span>
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/85">
            <Loader2 className="text-brand-600 size-6 animate-spin" />
            <span className="bg-brand-100 h-1.5 w-40 overflow-hidden rounded-full">
              <span
                className="bg-brand-600 block h-full rounded-full transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </span>
            <span className="text-brand-muted text-caption tabular-nums">
              Uploading… {progress}%
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={secondaryBtn}
        >
          <Upload className="size-4" /> {value ? "Replace" : "Upload"}
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          disabled={uploading}
          className={secondaryBtn}
        >
          <Images className="size-4" /> Media library
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={uploading}
            className={`${secondaryBtn} hover:text-red-700`}
          >
            <Trash2 className="size-4" /> Remove
          </button>
        )}
      </div>

      {message ? (
        <p className="text-small text-red-600">{message}</p>
      ) : (
        <p className="text-brand-muted text-caption">{hint}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <MediaPickerDialog
        open={libraryOpen}
        title="Choose a thumbnail"
        onClose={() => setLibraryOpen(false)}
        onPick={(item) => {
          setUploadError(null);
          onChange(item.url);
        }}
      />
    </div>
  );
}
