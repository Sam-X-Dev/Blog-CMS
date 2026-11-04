"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/slugify";

/** "Export .md" button: downloads the current blog content as a Markdown file. */
export function MarkdownExport({ editor, title }: { editor: Editor; title?: string }) {
  const [busy, setBusy] = useState(false);

  async function exportMarkdown() {
    if (editor.isEmpty) {
      toast.error("Write something first, then export it.");
      return;
    }
    setBusy(true);
    try {
      const { default: TurndownService } = await import("turndown");
      const turndown = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        bulletListMarker: "-",
        emDelimiter: "*",
      });
      // Pictures with a caption: keep the picture and put the caption under it in italics
      turndown.addRule("figure", {
        filter: "figure",
        replacement: (_content, node) => {
          const el = node as HTMLElement;
          const img = el.querySelector("img");
          const caption = el.querySelector("figcaption")?.textContent?.trim();
          if (!img) return "";
          const alt = img.getAttribute("alt") ?? "";
          return `\n\n![${alt}](${img.getAttribute("src")})${caption ? `\n*${caption}*` : ""}\n\n`;
        },
      });

      const heading = title?.trim() ? `# ${title.trim()}\n\n` : "";
      const markdown = heading + turndown.turndown(editor.getHTML()) + "\n";
      const url = URL.createObjectURL(
        new Blob([markdown], { type: "text/markdown;charset=utf-8" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slugify(title ?? "") || "blog"}.md`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Markdown file downloaded");
    } catch {
      toast.error("Could not export the blog. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      title="Download this blog as a Markdown (.md) file"
      disabled={busy}
      onMouseDown={(e) => e.preventDefault()}
      onClick={exportMarkdown}
      className="border-brand-200 text-brand-900 hover:bg-brand-50 text-small flex h-8 shrink-0 items-center gap-2 rounded-md border bg-white px-3 font-medium whitespace-nowrap transition-colors disabled:opacity-60"
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
      Export .md
    </button>
  );
}
