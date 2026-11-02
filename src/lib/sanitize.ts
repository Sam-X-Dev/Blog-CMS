import "server-only";
import sanitizeHtml from "sanitize-html";

const color = [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i];

/**
 * Cleans blog HTML before it is saved or shown on the website.
 * Keeps everything the editor can make (headings, colours, tables, images…)
 * and removes anything dangerous (<script>, onclick=, javascript: links, iframes…).
 * Fonts and font sizes are removed too: every blog uses the website's own type scale.
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