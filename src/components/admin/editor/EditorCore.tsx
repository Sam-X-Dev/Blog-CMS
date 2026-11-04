"use client";

import "./editor.css";
import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { BLOG_PROSE_CLASS } from "@/lib/editor-options";
import { createExtensions } from "./extensions";
import { uploadIntoEditor } from "./image-upload";
import type { ImportedMeta } from "./MarkdownImport";
import { Ribbon } from "./Ribbon";
import { useRibbonState } from "./use-ribbon-state";

export type BlogEditorProps = {
  /** Blog content as HTML ("" when empty) */
  value: string;
  onChange: (html: string) => void;
  /** Called after "Import .md" with the title/description from the file's front matter */
  onImport?: (meta: ImportedMeta) => void;
  /** Blog title, used by "Export .md" */
  exportTitle?: string;
  placeholder?: string;
  error?: string;
};

/** The real editor. Loaded only in the browser through BlogEditor.tsx. */
export default function EditorCore({
  value,
  onChange,
  onImport,
  exportTitle,
  placeholder = "Start writing your blog...",
  error,
}: BlogEditorProps) {
  // Keep the latest onChange without re-creating the editor
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // The paste/drop handlers below need the editor, which only exists after useEditor runs
  const editorRef = useRef<Editor | null>(null);

  const editor = useEditor({
    extensions: createExtensions(placeholder),
    content: value,
    immediatelyRender: false, // required with server rendering in Next.js
    editorProps: {
      attributes: {
        class: `${BLOG_PROSE_CLASS} min-h-[480px] focus:outline-none`,
        "aria-label": "Blog content",
      },
      // Pasting a screenshot / copied image uploads it.
      // (Pasting from Word or a web page keeps its own content, so text isn't lost.)
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData?.files);
        if (!files.length || event.clipboardData?.getData("text/html")) return false;
        if (editorRef.current) uploadIntoEditor(editorRef.current, files);
        return true;
      },
      // Dropping image files from the computer uploads them where they were dropped
      handleDrop: (view, event, _slice, moved) => {
        const files = imageFiles(event.dataTransfer?.files);
        if (moved || !files.length) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        if (editorRef.current) uploadIntoEditor(editorRef.current, files, pos);
        return true;
      },
    },
    onUpdate: ({ editor: e }) => onChangeRef.current(e.isEmpty ? "" : e.getHTML()),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // When the form loads an existing blog later (Edit page), show it in the editor
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) {
      editor
        .chain()
        .setMeta("addToHistory", false)
        .setContent(value || "", { emitUpdate: false })
        .run();
    }
  }, [editor, value]);

  if (!editor) return <EditorSkeleton />;

  return (
    <EditorShell editor={editor} onImport={onImport} exportTitle={exportTitle} error={error} />
  );
}

function EditorShell({
  editor,
  onImport,
  exportTitle,
  error,
}: {
  editor: Editor;
  onImport?: (meta: ImportedMeta) => void;
  exportTitle?: string;
  error?: string;
}) {
  const s = useRibbonState(editor);
  const [fullscreen, setFullscreen] = useState(false);

  // Esc leaves full screen
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const readingMinutes = Math.max(1, Math.ceil(s.words / 200));

  return (
    <div>
      <div
        className={`blog-editor flex flex-col overflow-hidden border bg-white ${
          fullscreen ? "fixed inset-0 z-50" : "rounded-xl"
        } ${error ? "border-red-500" : "border-brand-200"}`}
      >
        <Ribbon
          editor={editor}
          s={s}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFullscreen((f) => !f)}
          onImport={onImport}
          exportTitle={exportTitle}
        />

        {/* The "page", like a Word document */}
        <div
          className={`bg-brand-50 overflow-y-auto px-3 py-8 sm:px-8 ${
            fullscreen ? "flex-1" : "max-h-[720px] min-h-[540px]"
          }`}
          onMouseDown={(e) => {
            // Clicking the grey area around the page puts the cursor at the end
            if (e.target === e.currentTarget) {
              e.preventDefault();
              editor.commands.focus("end");
            }
          }}
        >
          <div className="ring-brand-200 mx-auto w-full max-w-[816px] rounded-md bg-white px-6 py-10 shadow-sm ring-1 sm:px-16 sm:py-14">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Status bar */}
        <div className="border-brand-200 bg-brand-50 text-caption text-brand-muted flex flex-wrap items-center gap-x-4 gap-y-2 border-t px-4 py-2.5">
          <span>
            {s.words.toLocaleString("en-IN")} words · {s.characters.toLocaleString("en-IN")}{" "}
            characters · {readingMinutes} min read
          </span>
        </div>
      </div>

      {error && <p className="text-small mt-1.5 text-red-600">{error}</p>}
    </div>
  );
}

/** Only the image files from a paste or drop */
function imageFiles(list: FileList | null | undefined) {
  return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}

export function EditorSkeleton() {
  return <div className="border-brand-200 bg-brand-50 h-[680px] animate-pulse rounded-xl border" />;
}
