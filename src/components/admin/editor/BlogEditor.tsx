"use client";

import dynamic from "next/dynamic";
import type { BlogEditorProps } from "./EditorCore";

/**
 * Office-style blog editor (Home / Insert / View / Table ribbon, Markdown import, preview).
 * It runs only in the browser (the editor can't be pre-rendered on the server).
 *
 * Usage in the Create/Edit Blog form (Samarth):
 *   <BlogEditor
 *     value={content}
 *     onChange={setContent}
 *     onImport={({ title, description }) => { if (title) setTitle(title); if (description) setDescription(description); }}
 *     error={errors.content}
 *   />
 * On save, the API must run sanitizeBlogHtml(content) from "@/lib/sanitize" before saving.
 */
export const BlogEditor = dynamic<BlogEditorProps>(() => import("./EditorCore"), {
    ssr: false,
    loading: () => (
        <div className="h-[680px] animate-pulse rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" />
    ),
});