"use client";

import "./editor.css";
import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { BlogContent } from "@/components/blog/BlogContent";
import { BLOG_PROSE_CLASS, GOOGLE_FONTS_URL } from "@/lib/editor-options";
import { createExtensions } from "./extensions";
import type { ImportedMeta } from "./MarkdownImport";
import { Ribbon } from "./Ribbon";
import { useRibbonState } from "./use-ribbon-state";

export type BlogEditorProps = {
    /** Blog content as HTML ("" when empty) */
    value: string;
    onChange: (html: string) => void;
    /** Called after "Import .md" with the title/description from the file's front matter */
    onImport?: (meta: ImportedMeta) => void;
    placeholder?: string;
    error?: string;
};

/** The real editor. Loaded only in the browser through BlogEditor.tsx. */
export default function EditorCore({
    value,
    onChange,
    onImport,
    placeholder = "Start writing your blog...",
    error,
}: BlogEditorProps) {
    // Keep the latest onChange without re-creating the editor
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    });

    const editor = useEditor({
        extensions: createExtensions(placeholder),
        content: value,
        immediatelyRender: false, // required with server rendering in Next.js
        editorProps: {
            attributes: {
                class: `${BLOG_PROSE_CLASS} min-h-[480px] focus:outline-none`,
                "aria-label": "Blog content",
            },
        },
        onUpdate: ({ editor: e }) => onChangeRef.current(e.isEmpty ? "" : e.getHTML()),
    });

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

    return <EditorShell editor={editor} onImport={onImport} error={error} />;
}

function EditorShell({
    editor,
    onImport,
    error,
}: {
    editor: Editor;
    onImport?: (meta: ImportedMeta) => void;
    error?: string;
}) {
    const s = useRibbonState(editor);
    const [mode, setMode] = useState<"write" | "preview">("write");
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
            {/* Fonts for the editor page (React 19 puts this in <head> once) */}
            <link rel="stylesheet" href={GOOGLE_FONTS_URL} precedence="default" />

            <div
                className={`blog-editor flex flex-col overflow-hidden border bg-white dark:bg-zinc-950 ${fullscreen ? "fixed inset-0 z-50" : "rounded-xl"
                    } ${error ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"}`}
            >
                <Ribbon
                    editor={editor}
                    s={s}
                    mode={mode}
                    onModeChange={setMode}
                    fullscreen={fullscreen}
                    onToggleFullscreen={() => setFullscreen((f) => !f)}
                    onImport={onImport}
                />

                {/* The "page", like a Word document */}
                <div
                    className={`overflow-y-auto bg-zinc-100 px-2 py-6 sm:px-6 dark:bg-zinc-900 ${fullscreen ? "flex-1" : "max-h-[720px] min-h-[540px]"
                        }`}
                    onMouseDown={(e) => {
                        // Clicking the grey area around the page puts the cursor at the end
                        if (mode === "write" && e.target === e.currentTarget) {
                            e.preventDefault();
                            editor.commands.focus("end");
                        }
                    }}
                >
                    <div className="mx-auto w-full max-w-[816px] rounded-sm bg-white px-6 py-10 shadow-md sm:px-16 sm:py-14 dark:bg-zinc-950">
                        {mode === "write" ? (
                            <EditorContent editor={editor} />
                        ) : editor.isEmpty ? (
                            <p className="text-sm text-zinc-400">Nothing to preview yet.</p>
                        ) : (
                            <BlogContent html={editor.getHTML()} />
                        )}
                    </div>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                    <span>
                        {s.words.toLocaleString("en-IN")} words · {s.characters.toLocaleString("en-IN")}{" "}
                        characters · {readingMinutes} min read
                    </span>
                    <div className="flex overflow-hidden rounded border border-zinc-300 dark:border-zinc-600">
                        {(["write", "preview"] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMode(m)}
                                className={`px-2 py-0.5 capitalize ${mode === m
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

export function EditorSkeleton() {
    return (
        <div className="h-[680px] animate-pulse rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" />
    );
}