"use client";

import { useEditorState, type Editor } from "@tiptap/react";

export type BlockStyle = "paragraph" | "h1" | "h2" | "h3" | "blockquote" | "codeBlock";

/**
 * Reads what's active at the cursor (bold? which style? inside a table?)
 * so the ribbon can highlight the right buttons. Re-renders only when these values change.
 */
export function useRibbonState(editor: Editor) {
    return useEditorState({
        editor,
        selector: ({ editor: e }) => {
            const block: BlockStyle = e.isActive("heading", { level: 1 })
                ? "h1"
                : e.isActive("heading", { level: 2 })
                    ? "h2"
                    : e.isActive("heading", { level: 3 })
                        ? "h3"
                        : e.isActive("blockquote")
                            ? "blockquote"
                            : e.isActive("codeBlock")
                                ? "codeBlock"
                                : "paragraph";

            return {
                bold: e.isActive("bold"),
                italic: e.isActive("italic"),
                underline: e.isActive("underline"),
                strike: e.isActive("strike"),
                superscript: e.isActive("superscript"),
                subscript: e.isActive("subscript"),
                align: (["center", "right", "justify"].find((a) => e.isActive({ textAlign: a })) ??
                    "left") as "left" | "center" | "right" | "justify",
                bulletList: e.isActive("bulletList"),
                orderedList: e.isActive("orderedList"),
                canIndent: e.can().sinkListItem("listItem"),
                canOutdent: e.can().liftListItem("listItem"),
                block,
                link: e.isActive("link"),
                linkHref: (e.getAttributes("link").href as string | undefined) ?? "",
                inTable: e.isActive("table"),
                imageSelected: e.isActive("figure") || e.isActive("image"),
                caption: (e.getAttributes("figure").caption as string | undefined) ?? "",
                canMergeOrSplit: e.can().mergeOrSplit(),
                canUndo: e.can().undo(),
                canRedo: e.can().redo(),
                words: e.storage.characterCount.words(),
                characters: e.storage.characterCount.characters(),
            };
        },
    });
}

export type RibbonState = ReturnType<typeof useRibbonState>;