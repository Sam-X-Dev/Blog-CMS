import { marked } from "marked";

export type ParsedMarkdown = {
    /** From the front matter, if the file has one */
    title?: string;
    description?: string;
    /** The body converted to HTML */
    html: string;
};

/**
 * Turns a .md file into HTML for the editor.
 * Reads an optional front-matter block at the top:
 *
 * ---
 * title: My first post
 * description: A short summary
 * ---
 */
export function parseMarkdown(source: string): ParsedMarkdown {
    const text = source.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
    const meta: Record<string, string> = {};
    let body = text;

    const frontMatter = text.match(/^---\n([\s\S]*?)\n---\n?/);
    if (frontMatter) {
        body = text.slice(frontMatter[0].length);
        for (const line of frontMatter[1].split("\n")) {
            const match = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
            if (match) meta[match[1].toLowerCase()] = match[2].trim().replace(/^["']|["']$/g, "");
        }
    }

    const html = marked.parse(body, { gfm: true, breaks: false, async: false });

    return {
        title: meta.title || undefined,
        description: meta.description || meta.summary || undefined,
        html,
    };
}