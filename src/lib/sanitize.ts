import "server-only";
import sanitizeHtml from "sanitize-html";
import { FONT_FAMILIES, FONT_SIZES } from "@/lib/editor-options";

const color = [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i];

const escape = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Only the editor's fonts, ignoring how quotes and spaces were written */
const FONT_FAMILY_PATTERNS = FONT_FAMILIES.filter((f) => f.value).map(
  (f) =>
    new RegExp(
      `^${f.value
        .split(",")
        .map((part) => `\\s*['"]?${escape(part.trim().replace(/['"]/g, ""))}['"]?\\s*`)
        .join(",")}$`,
      "i"
    )
);
const FONT_SIZE_PATTERNS = FONT_SIZES.filter((f) => f.value).map(
  (f) => new RegExp(`^${escape(f.value)}$`)
);

/**
 * Cleans blog HTML before it is saved or shown on the website.
 * Keeps everything the editor can make (headings, colours, tables, images…)
 * and removes anything dangerous (<script>, onclick=, javascript: links, iframes…).
 * Fonts and font sizes are kept only when they are one of the editor's choices.
 *
 * Use on the SERVER only, e.g. in the blog API before prisma.blog.create/update:
 *   content: sanitizeBlogHtml(parsed.data.content)
 */
export function sanitizeBlogHtml(dirty: string): string {
    return sanitizeHtml(dirty, {
        allowedTags: [
            "p",
            "br",
            "h1",
            "h2",
            "h3",
            "h4",
            "blockquote",
            "pre",
            "code",
            "hr",
            "strong",
            "b",
            "em",
            "i",
            "u",
            "s",
            "strike",
            "sub",
            "sup",
            "span",
            "mark",
            "a",
            "ul",
            "ol",
            "li",
            "img",
            "figure",
            "figcaption",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
            "colgroup",
            "col",
        ],
        allowedAttributes: {
            a: ["href", "target", "rel"],
            img: ["src", "alt", "title", "width", "height"],
            th: ["colspan", "rowspan", "colwidth", "style"],
            td: ["colspan", "rowspan", "colwidth", "style"],
            code: ["class"],
            mark: ["data-color", "style"],
            "*": ["style"],
        },
        allowedClasses: { code: [/^language-[\w-]+$/] },
        allowedStyles: {
            "*": {
                color,
                "background-color": color,
                "text-align": [/^(left|right|center|justify)$/],
                "font-family": FONT_FAMILY_PATTERNS,
                "font-size": FONT_SIZE_PATTERNS,
                "min-width": [/^\d+px$/],
                width: [/^\d+px$/],
            },
        },
        allowedSchemes: ["http", "https", "mailto"],
        allowedSchemesByTag: { img: ["http", "https"] },
        // Drop images whose link was removed (e.g. javascript: links)
        exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
        transformTags: {
            a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
        },
    });
}