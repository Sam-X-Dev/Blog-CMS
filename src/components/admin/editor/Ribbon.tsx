"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Eye, Maximize2, Minimize2, PencilLine, Redo2, Undo2 } from "lucide-react";
import { HomeTab } from "./HomeTab";
import { InsertTab } from "./InsertTab";
import { MarkdownImport, type ImportedMeta } from "./MarkdownImport";
import { RibbonButton, RibbonGroup } from "./ribbon-ui";
import { TableTab } from "./TableTab";
import type { RibbonState } from "./use-ribbon-state";

type TabId = "home" | "insert" | "view" | "table";

type RibbonProps = {
    editor: Editor;
    s: RibbonState;
    mode: "write" | "preview";
    onModeChange: (mode: "write" | "preview") => void;
    fullscreen: boolean;
    onToggleFullscreen: () => void;
    onImport?: (meta: ImportedMeta) => void;
};

export function Ribbon({
    editor,
    s,
    mode,
    onModeChange,
    fullscreen,
    onToggleFullscreen,
    onImport,
}: RibbonProps) {
    const [tab, setTab] = useState<TabId>("home");
    const preview = mode === "preview";

    // The Table tab only exists while the cursor is in a table
    const tabs: { id: TabId; label: string }[] = [
        { id: "home", label: "Home" },
        { id: "insert", label: "Insert" },
        { id: "view", label: "View" },
        ...(s.inTable && !preview ? [{ id: "table" as const, label: "Table" }] : []),
    ];
    const current: TabId = tab === "table" && (!s.inTable || preview) ? "home" : tab;

    return (
        <div className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
            {/* Tab strip */}
            <div className="flex items-end justify-between gap-2 border-b border-zinc-200 px-2 pt-1 dark:border-zinc-700">
                <div role="tablist" className="flex">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            aria-selected={current === t.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setTab(t.id)}
                            className={`-mb-px rounded-t-md border border-b-0 px-3 py-1.5 text-xs font-medium ${current === t.id
                                    ? "border-zinc-200 bg-white text-indigo-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-indigo-300"
                                    : `border-transparent hover:bg-zinc-200/60 dark:hover:bg-zinc-800 ${t.id === "table"
                                        ? "text-amber-700 dark:text-amber-400"
                                        : "text-zinc-600 dark:text-zinc-400"
                                    }`
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1 pb-1">
                    <RibbonButton
                        icon={Undo2}
                        label="Undo"
                        shortcut="Ctrl/⌘+Z"
                        disabled={!s.canUndo || preview}
                        onClick={() => editor.chain().focus().undo().run()}
                    />
                    <RibbonButton
                        icon={Redo2}
                        label="Redo"
                        shortcut="Ctrl/⌘+Shift+Z"
                        disabled={!s.canRedo || preview}
                        onClick={() => editor.chain().focus().redo().run()}
                    />
                    {!preview && <MarkdownImport editor={editor} onImport={onImport} />}
                </div>
            </div>

            {/* Tab content */}
            <div className="flex min-h-[86px] flex-wrap items-stretch gap-y-2 bg-white px-1 py-1.5 dark:bg-zinc-950">
                {current === "view" ? (
                    <>
                        <RibbonGroup label="Mode">
                            <RibbonButton
                                large
                                icon={PencilLine}
                                label="Write"
                                active={!preview}
                                onClick={() => onModeChange("write")}
                            />
                            <RibbonButton
                                large
                                icon={Eye}
                                label="Preview"
                                active={preview}
                                onClick={() => onModeChange("preview")}
                            />
                        </RibbonGroup>
                        <RibbonGroup label="Window">
                            <RibbonButton
                                large
                                icon={fullscreen ? Minimize2 : Maximize2}
                                label={fullscreen ? "Exit full screen" : "Full screen"}
                                onClick={onToggleFullscreen}
                            />
                        </RibbonGroup>
                    </>
                ) : preview ? (
                    <p className="flex items-center px-3 text-xs text-zinc-500">
                        Preview mode: this is how readers will see the blog. Switch back to Write in the View
                        tab or the status bar.
                    </p>
                ) : current === "insert" ? (
                    <InsertTab editor={editor} s={s} />
                ) : current === "table" ? (
                    <TableTab editor={editor} s={s} />
                ) : (
                    <HomeTab editor={editor} s={s} />
                )}
            </div>
        </div>
    );
}