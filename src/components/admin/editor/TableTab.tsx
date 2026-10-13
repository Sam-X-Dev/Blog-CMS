"use client";

import type { Editor } from "@tiptap/react";
import {
    BetweenHorizontalEnd,
    BetweenHorizontalStart,
    BetweenVerticalEnd,
    BetweenVerticalStart,
    Columns3,
    PanelTop,
    Rows3,
    TableCellsMerge,
    Trash2,
} from "lucide-react";
import { RibbonButton, RibbonGroup } from "./ribbon-ui";
import type { RibbonState } from "./use-ribbon-state";

/** Shown only while the cursor is inside a table (like Office's "Table Layout" tab) */
export function TableTab({ editor, s }: { editor: Editor; s: RibbonState }) {
    const chain = () => editor.chain().focus();

    return (
        <>
            <RibbonGroup label="Rows & Columns">
                <RibbonButton
                    large
                    icon={BetweenHorizontalStart}
                    label="Row above"
                    onClick={() => chain().addRowBefore().run()}
                />
                <RibbonButton
                    large
                    icon={BetweenHorizontalEnd}
                    label="Row below"
                    onClick={() => chain().addRowAfter().run()}
                />
                <RibbonButton
                    large
                    icon={BetweenVerticalStart}
                    label="Column left"
                    onClick={() => chain().addColumnBefore().run()}
                />
                <RibbonButton
                    large
                    icon={BetweenVerticalEnd}
                    label="Column right"
                    onClick={() => chain().addColumnAfter().run()}
                />
            </RibbonGroup>

            <RibbonGroup label="Delete">
                <RibbonButton
                    large
                    icon={Rows3}
                    label="Delete row"
                    onClick={() => chain().deleteRow().run()}
                />
                <RibbonButton
                    large
                    icon={Columns3}
                    label="Delete column"
                    onClick={() => chain().deleteColumn().run()}
                />
                <RibbonButton
                    large
                    icon={Trash2}
                    label="Delete table"
                    onClick={() => chain().deleteTable().run()}
                />
            </RibbonGroup>

            <RibbonGroup label="Cells">
                <RibbonButton
                    large
                    icon={TableCellsMerge}
                    label="Merge / Split"
                    disabled={!s.canMergeOrSplit}
                    onClick={() => chain().mergeOrSplit().run()}
                />
                <RibbonButton
                    large
                    icon={PanelTop}
                    label="Header row"
                    onClick={() => chain().toggleHeaderRow().run()}
                />
            </RibbonGroup>
        </>
    );
}