"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";

const button =
  "border-brand-200 text-brand-900 hover:bg-brand-50 text-small inline-flex h-9 items-center gap-2 rounded-full border bg-white px-3.5 font-medium transition-colors";

/** Copy link, WhatsApp and LinkedIn. The link is read when clicked, so it's always the real page URL. */
export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const pageUrl = () => window.location.origin + window.location.pathname;

  async function copy() {
    try {
      await navigator.clipboard.writeText(pageUrl());
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link. Copy it from the address bar instead.");
    }
  }

  function open(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-brand-muted text-small mr-1 font-medium">Share:</span>
      <button type="button" onClick={copy} className={button}>
        {copied ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <Link2 className="size-4" aria-hidden />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${title} ${pageUrl()}`)}`)}
        className={button}
      >
        <svg viewBox="0 0 24 24" className="size-4 fill-[#25D366]" aria-hidden>
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06a6.75 6.75 0 0 1-3.37-2.95c-.26-.44.25-.41.73-1.36.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.24-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74 1.58.68 2.2.74 2.98.62.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
        </svg>
        WhatsApp
      </button>
      <button
        type="button"
        onClick={() =>
          open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl())}`
          )
        }
        className={button}
      >
        <svg viewBox="0 0 24 24" className="size-4 fill-[#0A66C2]" aria-hidden>
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
        </svg>
        LinkedIn
      </button>
    </div>
  );
}
