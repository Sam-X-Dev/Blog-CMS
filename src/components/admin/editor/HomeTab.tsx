"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
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
import {
  FONT_FAMILIES,
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
  normalizeFont,
} from "@/lib/editor-options";
import { Select } from "@/components/ui/Select";
import {
  ColorGrid,
  ColorSplitButton,
  RibbonButton,
  RibbonDivider,
  RibbonGroup,
  keepFocus,
} from "./ribbon-ui";
import type { BlockStyle, RibbonState } from "./use-ribbon-state";

const MOD = "Ctrl/⌘";

/** The Styles gallery. Previews use the site's own type scale, scaled down to fit a tile. */
const STYLES: { id: BlockStyle; label: string; preview: string }[] = [
  { id: "paragraph", label: "Normal", preview: "text-small text-brand-900" },
  { id: "h1", label: "Heading 1", preview: "text-heading font-bold text-brand-900" },
  { id: "h2", label: "Heading 2", preview: "text-body font-bold text-brand-900" },
  { id: "h3", label: "Heading 3", preview: "text-small font-semibold text-brand-900" },
  { id: "blockquote", label: "Quote", preview: "text-small italic text-brand-muted" },
  { id: "codeBlock", label: "Code", preview: "font-mono text-caption text-brand-900" },
];

export function HomeTab({ editor, s }: { editor: Editor; s: RibbonState }) {
  const [textColor, setTextColor] = useState("#c00000");
  const [highlight, setHighlight] = useState("#fef08a");
  const chain = () => editor.chain().focus();
  // Font and size at the cursor ("" = website default)
  const fontValue =
    FONT_FAMILIES.find((f) => f.value && normalizeFont(f.value) === normalizeFont(s.fontFamily))
      ?.value ?? "";
  const sizeValue = FONT_SIZES.find((f) => f.value === s.fontSize)?.value ?? "";

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

  return (
    <>
      <RibbonGroup label="Font">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Select
              aria-label="Font"
              value={fontValue}
              onChange={(v) =>
                v ? chain().setFontFamily(v).run() : chain().unsetFontFamily().run()
              }
              className="text-caption h-8 w-36 px-2"
              options={FONT_FAMILIES.map((f) => ({ value: f.value, label: f.label }))}
            />
            <Select
              aria-label="Font size"
              value={sizeValue}
              onChange={(v) => (v ? chain().setFontSize(v).run() : chain().unsetFontSize().run())}
              className="text-caption h-8 w-28 px-2"
              options={FONT_SIZES.map((f) => ({ value: f.value, label: f.label }))}
            />
          </div>
          <div className="flex items-center gap-0.5">
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
          </div>

          <div className="flex items-center gap-0.5">
            {/* Click = last colour, arrow = choose another (like Office) */}
            <ColorSplitButton
              label="Font colour"
              icon={<span className="text-body leading-none font-bold">A</span>}
              color={textColor}
              onApply={() => chain().setColor(textColor).run()}
            >
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
            </ColorSplitButton>

            <ColorSplitButton
              label="Highlight colour"
              icon={<Highlighter className="size-4" strokeWidth={1.75} />}
              color={highlight}
              onApply={() => chain().toggleHighlight({ color: highlight }).run()}
            >
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
            </ColorSplitButton>

            <RibbonDivider />

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
          <div className="flex items-center gap-0.5">
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
          <div className="flex items-center gap-0.5">
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
        <div className="flex gap-1.5">
          {STYLES.map((style) => {
            const active = s.block === style.id;
            return (
              <button
                key={style.id}
                type="button"
                title={style.label}
                aria-pressed={active}
                onMouseDown={keepFocus}
                onClick={() => applyStyle(style.id)}
                className={`flex h-16 w-[92px] shrink-0 flex-col items-start justify-between overflow-hidden rounded-lg border bg-white px-2.5 py-2 text-left transition-colors ${
                  active
                    ? "border-brand-400 bg-brand-50 ring-brand-200 ring-1"
                    : "border-brand-200 hover:border-brand-400 hover:bg-brand-50"
                }`}
              >
                <span
                  className={`w-full overflow-hidden leading-tight whitespace-nowrap ${style.preview}`}
                >
                  AaBbCc
                </span>
                <span className="text-caption text-brand-muted w-full truncate leading-none">
                  {style.label}
                </span>
              </button>
            );
          })}
        </div>
      </RibbonGroup>
    </>
  );
}
