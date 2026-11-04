import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { Figure } from "./figure";

/** Everything the blog editor can do. Anything not listed here is removed from pasted/imported content. */
export function createExtensions(placeholder: string) {
    return [
        StarterKit.configure({
            heading: { levels: [1, 2, 3] },
            link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
        }),
        // Text colour, font and font size (the choices are in lib/editor-options.ts)
        TextStyleKit.configure({
            backgroundColor: false,
            lineHeight: false,
        }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Highlight.configure({ multicolor: true }),
        Subscript,
        Superscript,
        Image,
        Figure,
        TableKit.configure({ table: { resizable: false } }),
        CharacterCount,
        Placeholder.configure({ placeholder }),
    ];
}