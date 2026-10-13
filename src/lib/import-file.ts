import { parseMarkdown } from "@/lib/markdown";

/** Code files are imported as a code block, with the language for colouring later */
const CODE_LANGUAGES: Record<string, string> = {
    java: "java",
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    c: "c",
    h: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    rb: "ruby",
    php: "php",
    kt: "kotlin",
    swift: "swift",
    rs: "rust",
    sql: "sql",
    sh: "bash",
    css: "css",
    json: "json",
    xml: "xml",
    yml: "yaml",
    yaml: "yaml",
};

/** Shown to the user and used by the file picker */
export const IMPORT_GROUPS = [
    { label: "Markdown", exts: ["md", "markdown"] },
    { label: "Word", exts: ["docx"] },
    { label: "PDF (text only)", exts: ["pdf"] },
    { label: "Web page", exts: ["html", "htm"] },
    { label: "Plain text", exts: ["txt"] },
    { label: "Code", exts: Object.keys(CODE_LANGUAGES) },
];

export const IMPORT_ACCEPT = IMPORT_GROUPS.flatMap((g) => g.exts.map((e) => `.${e}`)).join(",");

const MB = 1024 * 1024;

export type ImportResult = {
    html: string;
    title?: string;
    description?: string;
    /** Extra info for the user, e.g. "Images were skipped" */
    note?: string;
};

export class ImportError extends Error { }

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain text → paragraphs (blank line = new paragraph, single line break kept) */
function textToHtml(text: string) {
    return text
        .replace(/\r\n/g, "\n")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
        .join("");
}

/** PDF lines → paragraphs: a line ending with . ! ? : closes the paragraph */
function pdfPageToHtml(text: string) {
    const paragraphs: string[] = [];
    let current = "";
    for (const raw of text.split("\n")) {
        const line = raw.trim();
        if (!line) {
            if (current) paragraphs.push(current);
            current = "";
            continue;
        }
        current = current ? `${current} ${line}` : line;
        if (/[.!?:]["')\]]?$/.test(line)) {
            paragraphs.push(current);
            current = "";
        }
    }
    if (current) paragraphs.push(current);
    return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

/**
 * Reads a file the user picked and turns it into HTML for the editor.
 * Runs in the browser. The editor itself removes anything it doesn't support
 * (scripts, unknown tags), and the server sanitizes again on save.
 */
export async function fileToHtml(file: File): Promise<ImportResult> {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const known = IMPORT_GROUPS.some((g) => g.exts.includes(ext));
    if (!known) throw new ImportError(`".${ext}" files can't be imported`);

    const heavy = ext === "pdf" || ext === "docx";
    if (file.size > (heavy ? 10 * MB : 1 * MB)) {
        throw new ImportError(`File is too large (max ${heavy ? 10 : 1} MB)`);
    }

    if (ext === "md" || ext === "markdown") return parseMarkdown(await file.text());

    if (ext === "txt") return { html: textToHtml(await file.text()) };

    if (ext === "html" || ext === "htm") {
        const doc = new DOMParser().parseFromString(await file.text(), "text/html");
        return { html: doc.body.innerHTML, title: doc.title.trim() || undefined };
    }

    if (ext === "docx") {
        // Loaded only when needed, so the editor stays fast
        const mammoth = await import("mammoth");
        const { value } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
        const hasImages = value.includes("<img");
        return {
            html: value,
            note: hasImages
                ? "Images inside the Word file were skipped. Add them with Insert → Picture."
                : undefined,
        };
    }

    if (ext === "pdf") {
        const { extractText, getDocumentProxy } = await import("unpdf");
        const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
        const { text } = await extractText(pdf, { mergePages: false });
        const html = text.map(pdfPageToHtml).join("");
        if (!html) {
            throw new ImportError("No text found in this PDF (it may be a scanned image)");
        }
        return {
            html,
            note: "PDF import brings in the text only. Check headings and add images yourself.",
        };
    }

    // Code file → one code block
    const language = CODE_LANGUAGES[ext];
    return {
        html: `<pre><code class="language-${language}">${escapeHtml(await file.text())}</code></pre>`,
    };
}