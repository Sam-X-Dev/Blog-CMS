"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IMPORT_ACCEPT, IMPORT_GROUPS, ImportError, fileToHtml } from "@/lib/import-file";

export type ImportedMeta = { title?: string; description?: string };

type MarkdownImportProps = {
    editor: Editor;
    /** Gets the title/description found in the file, so the blog form can fill empty fields */
    onImport?: (meta: ImportedMeta) => void;
};

const SUPPORTED = IMPORT_GROUPS.map((g) => g.label).join(", ");

/**
 * "Import file" button. Adds the file's content AT THE CURSOR,
 * so whatever was already written stays (like Word's Insert → Text from File).
 */
export function MarkdownImport({ editor, onImport }: MarkdownImportProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow picking the same file again
        if (!file) return;

        setBusy(true);
        try {
            const { html, title, description, note } = await fileToHtml(file);

            // Never delete anything that is already there:
            // - empty editor → just fill it
            // - something selected (an image, a table, some text) → add the file AFTER it
            // - otherwise → add the file where the cursor is
            const { empty, to } = editor.state.selection;
            const blank = editor.isEmpty && editor.state.doc.childCount <= 1;
            if (blank) editor.chain().focus().setContent(html).run();
            else if (empty) editor.chain().focus().insertContent(html).run();
            else editor.chain().focus().insertContentAt(to, html).run();

            onImport?.({ title, description });
            toast.success(`Imported "${file.name}". Press Ctrl/⌘+Z to undo.`, { description: note });
        } catch (err) {
            toast.error(err instanceof ImportError ? err.message : "Could not read this file", {
                description: `Supported: ${SUPPORTED}`,
            });
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept={IMPORT_ACCEPT}
                className="hidden"
                onChange={handleFile}
            />
            <button
                type="button"
                title={`Insert a file at the cursor. Supported: ${SUPPORTED}`}
                disabled={busy}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="flex h-7 items-center gap-1.5 rounded border border-zinc-300 bg-white px-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <FileUp className="size-3.5" />}
                {busy ? "Importing..." : "Import file"}
            </button>
        </>
    );
}