"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { MediaItem } from "@/types/media";
import { MediaLibrary } from "./MediaLibrary";

type MediaPickerDialogProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onPick: (item: MediaItem) => void;
};

/** Pop-up to upload a new image or pick one already in the Media library. Esc closes it. */
export function MediaPickerDialog({
  open,
  title = "Choose an image",
  onClose,
  onPick,
}: MediaPickerDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Click on the dark backdrop closes it
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="backdrop:bg-brand-900/40 m-auto w-[min(56rem,calc(100vw-2rem))] rounded-2xl bg-white p-0 shadow-xl"
    >
      <div className="border-brand-200 flex items-center justify-between gap-4 border-b px-6 py-4">
        <h2 className="text-brand-900 text-heading">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-brand-muted hover:text-brand-900 hover:bg-brand-50 flex size-9 items-center justify-center rounded-md"
        >
          <X className="size-5" />
        </button>
      </div>
      {/* Only mounted while open, so the list is fresh every time */}
      <div className="max-h-[70vh] overflow-y-auto p-6">
        {open && (
          <MediaLibrary
            mode="pick"
            onPick={(item) => {
              onPick(item);
              onClose();
            }}
          />
        )}
      </div>
    </dialog>
  );
}
