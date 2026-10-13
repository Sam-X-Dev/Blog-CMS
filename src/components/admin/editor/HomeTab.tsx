"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Baseline,
    Bold,
    Highlighter,
    Italic,
    List,
    ListIndentDecrease,
    ListIndentIncrease,
    ListOrdered,
    RemoveFormatting,
    Strikethrough,
    Subscript,
    Superscript,
    Underline,
} from "lucide-react";
import { FONT_FAMILIES, FONT_SIZES, HIGHLIGHT_COLORS, TEXT_COLORS } from "@/lib/editor-options";
import { ColorGrid, Dropdown, RibbonButton, RibbonGroup, selectClass } from "./ribbon-ui";
import type { BlockStyle, RibbonState } from "./use-ribbon-state";

const MOD = "Ctrl/⌘";

const STYLES: { id: BlockStyle; label: string; preview: string }[] = [
    { id: "paragraph", label: "Normal", preview: "text-[13px]" },
    { id: "h1", label: "Heading 1", preview: "text-[17px] font-bold" },
    { id: "h2", label: "Heading 2", preview: "text-[15px] font-bold" },
    { id: "h3", label: "Heading 3", preview: "text-[13px] font-semibold" },
    { id: "blockquote", label: "Quote", preview: "text-[13px] italic text-zinc-500" },
    { id: "codeBlock", label: "Code", preview: "font-mono text-[12px]" },
];

export function HomeTab({ editor, s }: { editor: Editor; s: RibbonState }) {
    const [textColor, setTextColor] = useState("#c00000");
    const [highlight, setHighlight] = useState("#fef08a");
    const chain = () => editor.chain().focus();

    function applyStyle(id: BlockStyle) {
        let c = chain();
        // Choosing another style takes the text out of a quote first (like Word)
        if (id !== "blockquote" && editor.isActive("blockquote")) c = c.unsetBlockquote();
        if (id === "paragraph") c.setParagraph().run();
        else if (id === "h1") c.setHeading({ level: 1 }).run();
        else if (id === "h2") c.setHeading({ level: 2 }).run();
        else if (id === "h3") c.setHeading({ level: 3 }).run();
        else if (id === "blockquote") c.setParagraph().setBlockquote().run();
        else c.setCodeBlock().run();
    }

    const knownFont = FONT_FAMILIES.some((f) => f.value === s.fontFamily);
    const knownSize = FONT_SIZES.includes(s.fontSize);

    return (
        <>
            <RibbonGroup label="Font">
                <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                        <select
                            aria-label="Font"
                            title="Font"
                            value={s.fontFamily}
                            onChange={(e) =>
                                e.target.value
                                    ? chain().setFontFamily(e.target.value).run()
                                    : chain().unsetFontFamily().run()
                            }
                            className={`${selectClass} w-40`}
                        >
                            {!knownFont && <option value={s.fontFamily}>{s.fontFamily}</option>}
                            {FONT_FAMILIES.map((f) => (
                                <option key={f.label} value={f.value} style={{ fontFamily: f.value || undefined }}>
                                    {f.label}
                                </option>
                            ))}
                        </select>
                        <select
                            aria-label="Font size"
                            title="Font size"
                            value={s.fontSize}
                            onChange={(e) =>
                                e.target.value
                                    ? chain().setFontSize(`${e.target.value}px`).run()
                                    : chain().unsetFontSize().run()
                            }
                            className={`${selectClass} w-16`}
                        >
                            {!knownSize && <option value={s.fontSize}>{s.fontSize}</option>}
                            {FONT_SIZES.map((size) => (
                                <option key={size || "default"} value={size}>
                                    {size || "Auto"}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center">
                        <RibbonButton
                            icon={Bold}
                            label="Bold"
                            shortcut={`${MOD}+B`}
                            active={s.bold}
                            onClick={() => chain().toggleBold().run()}
                        />
                        <RibbonButton
                            icon={Italic}
                            label="Italic"
                            shortcut={`${MOD}+I`}
                            active={s.italic}
                            onClick={() => chain().toggleItalic().run()}
                        />
                        <RibbonButton
                            icon={Underline}
                            label="Underline"
                            shortcut={`${MOD}+U`}
                            active={s.underline}
                            onClick={() => chain().toggleUnderline().run()}
                        />
                        <RibbonButton
                            icon={Strikethrough}
                            label="Strikethrough"
                            shortcut={`${MOD}+Shift+S`}
                            active={s.strike}
                            onClick={() => chain().toggleStrike().run()}
                        />
                        <RibbonButton
                            icon={Superscript}
                            label="Superscript"
                            shortcut={`${MOD}+.`}
                            active={s.superscript}
                            onClick={() => chain().unsetSubscript().toggleSuperscript().run()}
                        />
                        <RibbonButton
                            icon={Subscript}
                            label="Subscript"
                            shortcut={`${MOD}+,`}
                            active={s.subscript}
                            onClick={() => chain().unsetSuperscript().toggleSubscript().run()}
                        />

                        {/* Split buttons like Office: click = last colour, arrow = choose colour */}
                        <div className="ml-1 flex items-center">
                            <button
                                type="button"
                                title="Font colour"
                                aria-label="Font colour"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => chain().setColor(textColor).run()}
                                className="flex size-7 flex-col items-center justify-center rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            >
                                <Baseline className="size-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.75} />
                                <span
                                    className="-mt-0.5 h-1 w-4 rounded-sm"
                                    style={{ backgroundColor: textColor }}
                                />
                            </button>
                            <Dropdown title="Choose font colour" arrowOnly trigger={null}>
                                {(close) => (
                                    <ColorGrid
                                        colors={TEXT_COLORS}
                                        resetLabel="Automatic"
                                        onPick={(c) => {
                                            setTextColor(c);
                                            chain().setColor(c).run();
                                            close();
                                        }}
                                        onReset={() => {
                                            chain().unsetColor().run();
                                            close();
                                        }}
                                    />
                                )}
                            </Dropdown>
                        </div>
                        <div className="flex items-center">
                            <button
                                type="button"
                                title="Highlight"
                                aria-label="Highlight"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => chain().toggleHighlight({ color: highlight }).run()}
                                className="flex size-7 flex-col items-center justify-center rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            >
                                <Highlighter
                                    className="size-4 text-zinc-700 dark:text-zinc-300"
                                    strokeWidth={1.75}
                                />
                                <span
                                    className="-mt-0.5 h-1 w-4 rounded-sm"
                                    style={{ backgroundColor: highlight }}
                                />
                            </button>
                            <Dropdown title="Choose highlight colour" arrowOnly trigger={null}>
                                {(close) => (
                                    <ColorGrid
                                        colors={HIGHLIGHT_COLORS}
                                        resetLabel="No highlight"
                                        onPick={(c) => {
                                            setHighlight(c);
                                            chain().setHighlight({ color: c }).run();
                                            close();
                                        }}
                                        onReset={() => {
                                            chain().unsetHighlight().run();
                                            close();
                                        }}
                                    />
                                )}
                            </Dropdown>
                        </div>
                        <RibbonButton
                            icon={RemoveFormatting}
                            label="Clear formatting"
                            onClick={() => chain().unsetAllMarks().clearNodes().run()}
                        />
                    </div>
                </div>
            </RibbonGroup>

            <RibbonGroup label="Paragraph">
                <div className="flex flex-col gap-1">
                    <div className="flex">
                        <RibbonButton
                            icon={List}
                            label="Bullets"
                            shortcut={`${MOD}+Shift+8`}
                            active={s.bulletList}
                            onClick={() => chain().toggleBulletList().run()}
                        />
                        <RibbonButton
                            icon={ListOrdered}
                            label="Numbering"
                            shortcut={`${MOD}+Shift+7`}
                            active={s.orderedList}
                            onClick={() => chain().toggleOrderedList().run()}
                        />
                        <RibbonButton
                            icon={ListIndentDecrease}
                            label="Decrease indent"
                            shortcut="Shift+Tab"
                            disabled={!s.canOutdent}
                            onClick={() => chain().liftListItem("listItem").run()}
                        />
                        <RibbonButton
                            icon={ListIndentIncrease}
                            label="Increase indent"
                            shortcut="Tab"
                            disabled={!s.canIndent}
                            onClick={() => chain().sinkListItem("listItem").run()}
                        />
                    </div>
                    <div className="flex">
                        <RibbonButton
                            icon={AlignLeft}
                            label="Align left"
                            shortcut={`${MOD}+Shift+L`}
                            active={s.align === "left"}
                            onClick={() => chain().setTextAlign("left").run()}
                        />
                        <RibbonButton
                            icon={AlignCenter}
                            label="Center"
                            shortcut={`${MOD}+Shift+E`}
                            active={s.align === "center"}
                            onClick={() => chain().setTextAlign("center").run()}
                        />
                        <RibbonButton
                            icon={AlignRight}
                            label="Align right"
                            shortcut={`${MOD}+Shift+R`}
                            active={s.align === "right"}
                            onClick={() => chain().setTextAlign("right").run()}
                        />
                        <RibbonButton
                            icon={AlignJustify}
                            label="Justify"
                            shortcut={`${MOD}+Shift+J`}
                            active={s.align === "justify"}
                            onClick={() => chain().setTextAlign("justify").run()}
                        />
                    </div>
                </div>
            </RibbonGroup>

            <RibbonGroup label="Styles">
                <div className="flex gap-1">
                    {STYLES.map((style) => (
                        <button
                            key={style.id}
                            type="button"
                            title={style.label}
                            aria-pressed={s.block === style.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyStyle(style.id)}
                            className={`flex h-[58px] w-[68px] flex-col items-start justify-between rounded border bg-white px-1.5 py-1 text-left hover:border-indigo-400 dark:bg-zinc-900 ${s.block === style.id
                                    ? "border-indigo-500 ring-1 ring-indigo-300 dark:ring-indigo-800"
                                    : "border-zinc-200 dark:border-zinc-700"
                                }`}
                        >
                            <span className={`leading-tight text-zinc-900 dark:text-zinc-100 ${style.preview}`}>
                                AaBbCc
                            </span>
                            <span className="text-[10px] text-zinc-500">{style.label}</span>
                        </button>
                    ))}
                </div>
            </RibbonGroup>
        </>
    );
}