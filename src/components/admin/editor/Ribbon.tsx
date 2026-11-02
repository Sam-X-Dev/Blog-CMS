"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Eye, Maximize2, Minimize2, PencilLine, Redo2, Undo2 } from "lucide-react";
import { HomeTab } from "./HomeTab";
import { InsertTab } from "./InsertTab";
import { MarkdownImport, type ImportedMeta } from "./MarkdownImport";
import { RibbonButton, RibbonDivider, RibbonGroup } from "./ribbon-ui";
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
        <div className="border-brand-200 border-b">
            {/* Tab strip */}
            <div className="border-brand-200 bg-brand-50 flex flex-wrap items-end justify-between gap-x-3 gap-y-1 border-b px-3 pt-2">
                <div role="tablist" className="flex gap-0.5">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            aria-selected={current === t.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setTab(t.id)}
                            className={`text-small -mb-px rounded-t-lg border border-b-0 px-4 py-2 font-medium transition-colors ${current === t.id
                                ? "border-brand-200 text-brand-900 bg-white"
                                : `hover:bg-brand-100/60 border-transparent ${t.id === "table"
                                    ? "text-brand-600 font-semibold"
                                    : "text-brand-muted hover:text-brand-900"
                                }`
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1 pb-1.5">
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
                    {!preview && (
                        <>
                            <RibbonDivider />
                            <MarkdownImport editor={editor} onImport={onImport} />
                        </>
                    )}
                </div>
            </div>

            {/* Tab content */}
            <div className="flex min-h-24 flex-wrap items-stretch gap-y-3 bg-white px-1 py-2.5">
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
                    <p className="text-small text-brand-muted flex items-center px-3">
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