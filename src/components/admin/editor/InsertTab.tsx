"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { ImageIcon, Link, SeparatorHorizontal, SquareCode, Table, Unlink } from "lucide-react";
import { Dropdown, RibbonButton, RibbonGroup, inputClass } from "./ribbon-ui";
import type { RibbonState } from "./use-ribbon-state";

/** "google.com" → "https://google.com"; keeps http(s), mailto and site links as they are */
function normalizeUrl(raw: string) {
    const url = raw.trim();
    if (!url) return "";
    if (/^(https?:\/\/|mailto:|\/)/i.test(url)) return url;
    return `https://${url}`;
}

const primaryBtn =
    "rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50";
const secondaryBtn =
    "rounded border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800";

function ImageForm({ editor, close }: { editor: Editor; close: () => void }) {
    const [src, setSrc] = useState("");
    const [alt, setAlt] = useState("");

    function insert(e: React.FormEvent) {
        e.preventDefault();
        const url = normalizeUrl(src);
        if (!url) return;
        // Picture + an empty line after it, with the cursor on that line,
        // so typing or importing next never replaces the picture
        editor
            .chain()
            .focus()
            .insertContent([
                { type: "image", attrs: { src: url, alt: alt.trim() || null } },
                { type: "paragraph" },
            ])
            .run();
        close();
    }

    return (
        <form onSubmit={insert} className="w-72 space-y-2">
            <p className="text-xs font-semibold">Insert picture</p>
            <input
                autoFocus
                className={inputClass}
                placeholder="Image link (https://...)"
                value={src}
                onChange={(e) => setSrc(e.target.value)}
            />
            <input
                className={inputClass}
                placeholder="Alt text (describe the image)"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
            />
            <p className="text-[11px] text-zinc-500">
                Uploading from your computer comes with the Media feature.
            </p>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={close} className={secondaryBtn}>
                    Cancel
                </button>
                <button type="submit" disabled={!src.trim()} className={primaryBtn}>
                    Insert
                </button>
            </div>
        </form>
    );
}

function LinkForm({ editor, href, close }: { editor: Editor; href: string; close: () => void }) {
    const [url, setUrl] = useState(href);

    function apply(e: React.FormEvent) {
        e.preventDefault();
        const clean = normalizeUrl(url);
        const chain = editor.chain().focus().extendMarkRange("link");
        if (clean) chain.setLink({ href: clean }).run();
        else chain.unsetLink().run();
        close();
    }

    return (
        <form onSubmit={apply} className="w-72 space-y-2">
            <p className="text-xs font-semibold">{href ? "Edit link" : "Insert link"}</p>
            <input
                autoFocus
                className={inputClass}
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-[11px] text-zinc-500">Select some text first to turn it into a link.</p>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={close} className={secondaryBtn}>
                    Cancel
                </button>
                <button type="submit" className={primaryBtn}>
                    {href ? "Update" : "Insert"}
                </button>
            </div>
        </form>
    );
}

const GRID = 8;

/** Word-style table picker: hover to choose rows × columns, click to insert */
function TableGrid({ editor, close }: { editor: Editor; close: () => void }) {
    const [size, setSize] = useState({ rows: 0, cols: 0 });

    return (
        <div className="w-[196px]" onMouseLeave={() => setSize({ rows: 0, cols: 0 })}>
            <p className="mb-2 text-xs font-semibold">
                {size.rows ? `${size.cols} × ${size.rows} Table` : "Insert Table"}
            </p>
            <div className="grid grid-cols-8 gap-0.5">
                {Array.from({ length: GRID * GRID }, (_, i) => {
                    const row = Math.floor(i / GRID) + 1;
                    const col = (i % GRID) + 1;
                    const on = row <= size.rows && col <= size.cols;
                    return (
                        <button
                            key={i}
                            type="button"
                            aria-label={`${col} by ${row} table`}
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => setSize({ rows: row, cols: col })}
                            onClick={() => {
                                editor
                                    .chain()
                                    .focus()
                                    .insertTable({ rows: row, cols: col, withHeaderRow: true })
                                    .run();
                                close();
                            }}
                            className={`size-5 border ${on
                                    ? "border-indigo-500 bg-indigo-100 dark:bg-indigo-900"
                                    : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800"
                                }`}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function InsertTab({ editor, s }: { editor: Editor; s: RibbonState }) {
    const iconLabel = (Icon: typeof Table, label: string) => (
        <>
            <Icon className="size-6" strokeWidth={1.75} />
            <span className="leading-none">{label}</span>
        </>
    );

    return (
        <>
            <RibbonGroup label="Tables">
                <Dropdown
                    large
                    title="Insert table"
                    trigger={iconLabel(Table, "Table")}
                    disabled={s.inTable}
                >
                    {(close) => <TableGrid editor={editor} close={close} />}
                </Dropdown>
            </RibbonGroup>

            <RibbonGroup label="Illustrations">
                <Dropdown large title="Insert picture" trigger={iconLabel(ImageIcon, "Picture")}>
                    {(close) => <ImageForm editor={editor} close={close} />}
                </Dropdown>
            </RibbonGroup>

            <RibbonGroup label="Links">
                <Dropdown large title="Insert link" trigger={iconLabel(Link, "Link")}>
                    {(close) => <LinkForm editor={editor} href={s.linkHref} close={close} />}
                </Dropdown>
                <RibbonButton
                    large
                    icon={Unlink}
                    label="Remove link"
                    disabled={!s.link}
                    onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
                />
            </RibbonGroup>

            <RibbonGroup label="Blocks">
                <RibbonButton
                    large
                    icon={SeparatorHorizontal}
                    label="Divider"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                />
                <RibbonButton
                    large
                    icon={SquareCode}
                    label="Code block"
                    active={s.block === "codeBlock"}
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                />
            </RibbonGroup>
        </>
    );
}