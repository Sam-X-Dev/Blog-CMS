"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import {
  ArrowLeft,
  Captions,
  ImageIcon,
  Images,
  Link,
  Link2,
  SeparatorHorizontal,
  Smile,
  SquareCode,
  Sticker,
  Table,
  Unlink,
  Upload,
} from "lucide-react";
import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";
import { EMOJI_GROUPS, STICKERS } from "@/lib/editor-options";
import { IMAGE_ACCEPT } from "@/lib/media-upload";
import { imageNodes, uploadIntoEditor } from "./image-upload";
import { Dropdown, DropdownLabel, RibbonButton, RibbonGroup, inputClass } from "./ribbon-ui";
import type { RibbonState } from "./use-ribbon-state";

/** "google.com" → "https://google.com"; keeps http(s), mailto and site links as they are */
function normalizeUrl(raw: string) {
  const url = raw.trim();
  if (!url) return "";
  if (/^(https?:\/\/|mailto:|\/)/i.test(url)) return url;
  return `https://${url}`;
}

const primaryBtn =
  "h-8 rounded-md bg-brand-600 px-4 text-small font-medium text-white hover:bg-brand-700 disabled:opacity-50";
const secondaryBtn =
  "h-8 rounded-md border border-brand-200 bg-white px-4 text-small font-medium text-brand-900 hover:bg-brand-50";
const formTitle = "text-small font-semibold text-brand-900";
const formHint = "text-caption text-brand-muted";

/** Picture from a web link (the old way, still handy for images hosted elsewhere) */
function ImageLinkForm({
  editor,
  close,
  onBack,
}: {
  editor: Editor;
  close: () => void;
  onBack: () => void;
}) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");

  function insert(e: React.FormEvent) {
    e.preventDefault();
    const url = normalizeUrl(src);
    if (!url) return;
    editor.chain().focus().insertContent(imageNodes(url, alt.trim())).run();
    close();
  }

  return (
    <form onSubmit={insert} className="w-80 space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="text-brand-muted hover:text-brand-900 text-caption inline-flex items-center gap-1 font-medium"
      >
        <ArrowLeft className="size-3.5" /> Back
      </button>
      <p className={formTitle}>Picture from a link</p>
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
      <div className="flex justify-end gap-2 pt-1">
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

const menuItem =
  "hover:bg-brand-50 flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors";

/** Insert → Picture: upload, Media library, or a web link */
function PictureMenu({
  editor,
  close,
  onUpload,
  onLibrary,
}: {
  editor: Editor;
  close: () => void;
  onUpload: () => void;
  onLibrary: () => void;
}) {
  const [view, setView] = useState<"menu" | "link">("menu");
  if (view === "link") {
    return <ImageLinkForm editor={editor} close={close} onBack={() => setView("menu")} />;
  }

  const options = [
    {
      icon: Upload,
      title: "Upload from computer",
      hint: "Or drag a picture straight into the page",
      onClick: () => {
        onUpload();
        close();
      },
    },
    {
      icon: Images,
      title: "Media library",
      hint: "Pick an image you uploaded before",
      onClick: () => {
        onLibrary();
        close();
      },
    },
    {
      icon: Link2,
      title: "From a link",
      hint: "An image already online",
      onClick: () => setView("link"),
    },
  ];

  return (
    <div className="w-72">
      {options.map(({ icon: Icon, title, hint, onClick }) => (
        <button
          key={title}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClick}
          className={menuItem}
        >
          <Icon className="text-brand-600 mt-0.5 size-5 shrink-0" strokeWidth={1.75} />
          <span className="flex flex-col gap-0.5">
            <span className="text-brand-900 text-small font-medium">{title}</span>
            <span className="text-brand-muted text-caption">{hint}</span>
          </span>
        </button>
      ))}
    </div>
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
    <form onSubmit={apply} className="w-80 space-y-3">
      <p className={formTitle}>{href ? "Edit link" : "Insert link"}</p>
      <input
        autoFocus
        className={inputClass}
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <p className={formHint}>Select some text first to turn it into a link.</p>
      <div className="flex justify-end gap-2 pt-1">
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
    <div className="w-[181px]" onMouseLeave={() => setSize({ rows: 0, cols: 0 })}>
      <p className={`${formTitle} mb-2.5`}>
        {size.rows ? `${size.cols} × ${size.rows} Table` : "Insert Table"}
      </p>
      <div className="grid grid-cols-8 gap-[3px]">
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
              className={`size-5 rounded-[3px] border transition-colors ${
                on ? "border-brand-400 bg-brand-100" : "border-brand-200 bg-white"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Caption under the selected picture. Turns an old plain picture into a figure. */
function CaptionForm({ editor, close }: { editor: Editor; close: () => void }) {
  // Remember which picture was selected when the form opened (typing here moves focus away)
  const [target] = useState(() => {
    const sel = editor.state.selection;
    if (!(sel instanceof NodeSelection)) return null;
    const { node } = sel;
    if (node.type.name !== "figure" && node.type.name !== "image") return null;
    return { pos: sel.from, node };
  });
  const [caption, setCaption] = useState<string>(
    (target?.node.attrs.caption as string | undefined) ?? ""
  );

  if (!target) {
    return <p className={`${formHint} w-64`}>Click a picture first, then add its caption.</p>;
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    const { pos, node } = target;
    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        tr.setNodeMarkup(pos, state.schema.nodes.figure, {
          src: node.attrs.src,
          alt: node.attrs.alt,
          caption: caption.trim(),
        });
        return true;
      })
      .run();
    close();
  }

  return (
    <form onSubmit={save} className="w-80 space-y-3">
      <p className={formTitle}>Picture caption</p>
      <input
        autoFocus
        maxLength={200}
        className={inputClass}
        placeholder="e.g. The dashboard after the update"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <p className={formHint}>Shown in small text under the picture. Leave empty to remove it.</p>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={close} className={secondaryBtn}>
          Cancel
        </button>
        <button type="submit" className={primaryBtn}>
          Save
        </button>
      </div>
    </form>
  );
}

/** Insert → Emoji: click one to add it at the cursor */
function EmojiGrid({ editor }: { editor: Editor }) {
  return (
    <div className="max-h-80 w-[304px] space-y-3 overflow-y-auto">
      {EMOJI_GROUPS.map((group) => (
        <div key={group.label}>
          <p className={`${formHint} mb-1.5 font-medium`}>{group.label}</p>
          <div className="grid grid-cols-8 gap-0.5">
            {group.items.map((emoji) => (
              <button
                key={emoji}
                type="button"
                title={emoji}
                aria-label={`Insert ${emoji}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().insertContent(emoji).run()}
                className="hover:bg-brand-50 flex size-9 items-center justify-center rounded-md text-[20px] leading-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Insert → Sticker: small badge pictures from /public/stickers */
function StickerGrid({ editor, close }: { editor: Editor; close: () => void }) {
  return (
    <div className="grid w-[392px] grid-cols-2 gap-2">
      {STICKERS.map((sticker) => (
        <button
          key={sticker.file}
          type="button"
          title={sticker.label}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            editor
              .chain()
              .focus()
              .insertContent([
                {
                  type: "image",
                  attrs: { src: `/stickers/${sticker.file}`, alt: `Sticker: ${sticker.label}` },
                },
                { type: "paragraph" },
              ])
              .run();
            close();
          }}
          className="hover:bg-brand-50 border-brand-200 flex items-center justify-center rounded-lg border p-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny local SVGs */}
          <img src={`/stickers/${sticker.file}`} alt={sticker.label} className="h-12 w-auto" />
        </button>
      ))}
    </div>
  );
}

export function InsertTab({ editor, s }: { editor: Editor; s: RibbonState }) {
  // Kept outside the dropdown so the file chooser still works after the dropdown closes
  const fileRef = useRef<HTMLInputElement>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  return (
    <>
      <RibbonGroup label="Tables">
        <Dropdown
          large
          title="Insert table"
          trigger={<DropdownLabel icon={Table} label="Table" />}
          disabled={s.inTable}
        >
          {(close) => <TableGrid editor={editor} close={close} />}
        </Dropdown>
      </RibbonGroup>

      <RibbonGroup label="Illustrations">
        <Dropdown
          large
          title="Insert picture"
          trigger={<DropdownLabel icon={ImageIcon} label="Picture" />}
        >
          {(close) => (
            <PictureMenu
              editor={editor}
              close={close}
              onUpload={() => fileRef.current?.click()}
              onLibrary={() => setLibraryOpen(true)}
            />
          )}
        </Dropdown>
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) uploadIntoEditor(editor, files);
          }}
        />
        <Dropdown
          large
          title="Picture caption"
          disabled={!s.imageSelected}
          trigger={<DropdownLabel icon={Captions} label="Caption" />}
        >
          {(close) => <CaptionForm editor={editor} close={close} />}
        </Dropdown>
        <Dropdown large title="Insert sticker" trigger={<DropdownLabel icon={Sticker} label="Sticker" />}>
          {(close) => <StickerGrid editor={editor} close={close} />}
        </Dropdown>
        <MediaPickerDialog
          open={libraryOpen}
          title="Insert a picture"
          onClose={() => setLibraryOpen(false)}
          onPick={(item) => editor.chain().focus().insertContent(imageNodes(item.url, null)).run()}
        />
      </RibbonGroup>

      <RibbonGroup label="Emoji">
        <Dropdown large title="Insert emoji" trigger={<DropdownLabel icon={Smile} label="Emoji" />}>
          {() => <EmojiGrid editor={editor} />}
        </Dropdown>
      </RibbonGroup>

      <RibbonGroup label="Links">
        <Dropdown large title="Insert link" trigger={<DropdownLabel icon={Link} label="Link" />}>
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
