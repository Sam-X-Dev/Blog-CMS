// Turns a PDF into editor HTML and keeps its structure and emphasis:
// headings, paragraphs, lists, bold, italic, text colours and centred lines.
// Fonts and font sizes are NOT copied: every blog uses the website's own type scale.
// Runs in the browser. PDF.js comes from "unpdf" and is loaded only when needed.
//
// How it works: a PDF has no paragraphs or headings, only pieces of text placed
// at x/y positions. We read those pieces (with their font, size and colour),
// rebuild lines and paragraphs from their positions, and turn them into HTML.

export type PdfImport = { html: string; title?: string; hadImages: boolean };

/** size is only used to find headings and paragraphs; it is not copied into the blog */
type Style = { bold: boolean; italic: boolean; color: string | null; size: number };
type Run = Style & { text: string };
/** size = biggest text on the line, main = size of most of its text */
type Line = {
    runs: Run[];
    x0: number;
    x1: number;
    y: number;
    size: number;
    main: number;
    page: number;
};
type Block =
    | { kind: "h"; level: 1 | 2 | 3; runs: Run[]; align: string }
    | { kind: "p"; runs: Run[]; align: string; last: Line }
    | { kind: "ul" | "ol"; items: Run[][]; last: Line };

/* ---------- small helpers ---------- */

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const lineText = (line: { runs: Run[] }) => line.runs.map((r) => r.text).join("");

const allBold = (line: { runs: Run[] }) => line.runs.every((r) => r.bold || !r.text.trim());

const sameStyle = (a: Style, b: Style) =>
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.color === b.color &&
    Math.abs(a.size - b.size) < 0.5;

/** The value that appears most often (weighted), e.g. the body text size */
function mostCommon(values: [number, number][]) {
    const counts = new Map<number, number>();
    for (const [value, weight] of values) counts.set(value, (counts.get(value) ?? 0) + weight);
    let best = 0;
    let bestCount = -1;
    for (const [value, count] of counts) if (count > bestCount) [best, bestCount] = [value, count];
    return best;
}

/** Keep real colours; plain black/dark grey and white become "default" */
function keepColor(hex: string | null) {
    if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return null;
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max < 90 && max - min < 25) return null; // black / very dark grey = normal text
    if (min > 235) return null; // white text would be invisible on the blog
    return hex.toLowerCase();
}

// Bullets, incl. the private-use symbols Word/LibreOffice use (e.g. U+F0B7)
const BULLET = /^\s*([•●◦▪▫■□‣⁃∙·–—*-]|[\uE000-\uF8FF])\s*/;
const NUMBERED = /^\s*(\(?\d{1,3}[.)]|[a-z][.)])\s+/;
const PAGE_NUMBER = /^\s*(page\s*)?\d{1,4}(\s*(of|\/)\s*\d{1,4})?\s*$/i;

/* ---------- 1. read every page into styled lines ---------- */

type PdfDoc = Awaited<ReturnType<typeof import("unpdf").getDocumentProxy>>;

async function readLines(pdf: PdfDoc) {
    const { getResolvedPDFJS } = await import("unpdf");
    const { OPS } = await getResolvedPDFJS();
    const lines: Line[] = [];
    let pageWidth = 595;
    let hadImages = false;

    for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        pageWidth = page.getViewport({ scale: 1 }).width;
        // The operator list has the colours (and loads the fonts); text content has the positions
        const ops = await page.getOperatorList();
        const content = await page.getTextContent();

        // Colour of every visible character, in drawing order
        const charColors: { ch: string; color: string | null }[] = [];
        let color: string | null = "#000000";
        const saved: (string | null)[] = [];
        for (let i = 0; i < ops.fnArray.length; i++) {
            const fn = ops.fnArray[i];
            const args = ops.argsArray[i];
            if (fn === OPS.save) saved.push(color);
            else if (fn === OPS.restore) color = saved.pop() ?? color;
            else if (fn === OPS.setFillRGBColor) color = typeof args[0] === "string" ? args[0] : null;
            else if (
                fn === OPS.paintImageXObject ||
                fn === OPS.paintInlineImageXObject ||
                fn === OPS.paintImageMaskXObject
            ) {
                hadImages = true;
            } else if (fn === OPS.showText) {
                for (const glyph of args[0] as ({ unicode?: string } | number | null)[]) {
                    if (!glyph || typeof glyph === "number" || !glyph.unicode) continue;
                    for (const ch of glyph.unicode.normalize("NFKC").replace(/\s/g, "")) {
                        charColors.push({ ch, color });
                    }
                }
            }
        }

        // Walk the text pieces and give each character its colour (matched in order)
        let cursor = 0;
        const nextColor = (ch: string) => {
            for (let look = cursor; look < Math.min(cursor + 40, charColors.length); look++) {
                if (charColors[look].ch === ch) {
                    cursor = look + 1;
                    return charColors[look].color;
                }
            }
            return null; // couldn't match: use default colour
        };

        let line: Line | null = null;
        let prevEnd = 0;
        const finishLine = () => {
            const done = line as Line | null;
            if (done && lineText(done).trim()) {
                done.main = mostCommon(done.runs.map((r) => [r.size, r.text.trim().length]));
                lines.push(done);
            }
            line = null;
        };

        for (const raw of content.items) {
            if (!("str" in raw)) continue;
            const item = raw as {
                str: string;
                fontName: string;
                transform: number[];
                width: number;
                height: number;
                hasEOL: boolean;
            };
            const [, , c, d, x, y] = item.transform;
            const size = Math.round(Math.hypot(c, d) * 2) / 2 || item.height;

            if (item.str) {
                const font = page.commonObjs.has(item.fontName)
                    ? (page.commonObjs.get(item.fontName) as {
                        name?: string;
                        bold?: boolean;
                        italic?: boolean;
                    })
                    : {};
                const fontName = font.name ?? "";
                const base = {
                    bold: Boolean(font.bold) || /bold|black|heavy|semibold|demi/i.test(fontName),
                    italic: Boolean(font.italic) || /italic|oblique/i.test(fontName),
                    size,
                };

                // A new line starts when the text moves up/down
                if (line && Math.abs((line as Line).y - y) > size * 0.5) finishLine();
                if (!line) {
                    line = { runs: [], x0: x, x1: x, y, size, main: size, page: p };
                } else if (x - prevEnd > size * 0.2) {
                    // Visible gap between two pieces on the same line = a space
                    const last = line.runs[line.runs.length - 1];
                    if (last && !/\s$/.test(last.text) && !/^\s/.test(item.str)) last.text += " ";
                }

                // Split the piece into runs where the colour changes
                let runColor: string | null | undefined;
                for (const ch of item.str) {
                    const chColor = /\s/.test(ch)
                        ? (runColor ?? null)
                        : keepColor(nextColor(ch.normalize("NFKC")[0]));
                    const last = line.runs[line.runs.length - 1];
                    const style: Style = { ...base, color: chColor };
                    if (last && sameStyle(last, style)) last.text += ch;
                    else line.runs.push({ ...style, text: ch });
                    runColor = chColor;
                }

                line.size = Math.max(line.size, size);
                line.x1 = Math.max(line.x1, x + item.width);
                prevEnd = x + item.width;
            }
            if (item.hasEOL) finishLine();
        }
        finishLine();
    }

    return { lines, pageWidth, hadImages };
}

/* ---------- 2. lines -> headings, paragraphs and lists ---------- */

function buildBlocks(lines: Line[], pageWidth: number) {
    const body = mostCommon(lines.map((l) => [l.main, lineText(l).length]));
    const left = mostCommon(lines.map((l) => [Math.round(l.x0), lineText(l).length]));
    // Normal distance between two lines of the same paragraph
    const gaps: [number, number][] = [];
    for (let i = 1; i < lines.length; i++) {
        const gap = lines[i - 1].y - lines[i].y;
        if (lines[i].page === lines[i - 1].page && gap > 0 && lines[i].size === body) {
            gaps.push([Math.round(gap), 1]);
        }
    }
    // Normal line spacing is about 1-1.8x the text size (ignore odd values from short documents)
    const lineGap = Math.min(body * 1.8, Math.max(body, mostCommon(gaps) || body * 1.3));

    // Headings: clearly bigger text that is bold (or very big). Biggest size = h1, next = h2, rest = h3
    const isBig = (l: Line) =>
        l.main / body >= 1.12 &&
        (allBold(l) || l.main / body >= 1.8) &&
        lineText(l).trim().length <= 150;
    const headingSizes = [...new Set(lines.filter(isBig).map((l) => l.main))].sort((a, b) => b - a);
    const firstLevel = headingSizes[0] / body >= 1.8 ? 1 : 2;
    const levelFor = (size: number) =>
        Math.min(3, firstLevel + headingSizes.indexOf(size)) as 1 | 2 | 3;

    const blocks: Block[] = [];
    let prev: Line | null = null;

    for (const line of lines) {
        const text = lineText(line).trim();
        if (PAGE_NUMBER.test(text)) continue; // page numbers in headers/footers

        const centre = (line.x0 + line.x1) / 2;
        const centred =
            Math.abs(centre - pageWidth / 2) < pageWidth * 0.04 && line.x0 > left + body * 2;
        const align = centred ? "center" : "";
        const gapBefore = prev && prev.page === line.page ? prev.y - line.y : Infinity;
        // Bigger text needs more room, so allow a bigger gap before calling it a new block
        const expectedGap = lineGap * Math.max(1, line.size / body, (prev?.size ?? body) / body);
        // A change in text size (e.g. a bigger line after normal text) also starts a new block
        const sizeChanged = prev ? Math.abs(line.main - prev.main) > body * 0.25 : false;
        const newBlock = gapBefore > expectedGap * 1.4 || gapBefore < 0 || sizeChanged;
        const last = blocks[blocks.length - 1];

        // A short all-bold line on its own (body size) also counts as a small heading
        const level: 1 | 2 | 3 | 0 = isBig(line)
            ? levelFor(line.main)
            : allBold(line) && text.length <= 80 && !/[.,;:]$/.test(text) && newBlock
                ? 3
                : 0;
        if (level) {
            if (last?.kind === "h" && last.level === level && !newBlock) {
                last.runs.push({ ...line.runs[0], text: " " }, ...line.runs);
            } else {
                blocks.push({ kind: "h", level, runs: line.runs, align });
            }
            prev = line;
            continue;
        }

        // Lists: "• item", "- item", "1. item", "a) item"
        const bullet = BULLET.test(text) ? "ul" : NUMBERED.test(text) ? "ol" : null;
        if (bullet) {
            const marker = bullet === "ul" ? BULLET : NUMBERED;
            const runs = stripMarker(line.runs, marker);
            if (last?.kind === bullet && !(gapBefore > lineGap * 2.5)) last.items.push(runs);
            else blocks.push({ kind: bullet, items: [runs], last: line });
            if (last?.kind === bullet) last.last = line;
            prev = line;
            continue;
        }

        // A wrapped list item: indented line right under a list item
        if ((last?.kind === "ul" || last?.kind === "ol") && !newBlock && line.x0 > left + body) {
            last.items[last.items.length - 1].push({ ...line.runs[0], text: " " }, ...line.runs);
            last.last = line;
            prev = line;
            continue;
        }

        // Paragraphs: join lines that sit close together; a gap or indent starts a new one
        const indented = line.x0 > left + body * 1.5 && !centred;
        const continuesAcrossPage =
            prev &&
            prev.page !== line.page &&
            last?.kind === "p" &&
            !/[.!?:"”)]$/.test(lineText(last.last).trim());
        if (
            last?.kind === "p" &&
            last.align === align &&
            ((!newBlock && !indented) || continuesAcrossPage)
        ) {
            const tail = last.runs[last.runs.length - 1];
            if (tail && /\w-$/.test(tail.text) && /^[a-z]/.test(text)) {
                tail.text = tail.text.slice(0, -1); // "deve-" + "lopment" -> "development"
            } else if (tail && !/\s$/.test(tail.text)) {
                last.runs.push({ ...tail, text: " " });
            }
            last.runs.push(...line.runs);
            last.last = line;
        } else {
            blocks.push({ kind: "p", runs: [...line.runs], align, last: line });
        }
        prev = line;
    }

    return { blocks, body };
}

function stripMarker(runs: Run[], marker: RegExp) {
    const copy = runs.map((r) => ({ ...r }));
    while (copy.length && !copy[0].text.trim()) copy.shift();
    if (copy.length) copy[0].text = copy[0].text.replace(marker, "");
    // The marker can be its own piece ("•" then "item")
    while (copy.length && !copy[0].text.trim()) copy.shift();
    if (copy.length) copy[0].text = copy[0].text.replace(/^\s+/, "");
    return copy;
}

/* ---------- 3. blocks -> HTML ---------- */

function runsToHtml(runs: Run[], inHeading: boolean) {
    // Merge neighbours with the same look so the HTML stays small
    const merged: Run[] = [];
    for (const run of runs) {
        const last = merged[merged.length - 1];
        if (last && sameStyle(last, run)) last.text += run.text;
        else merged.push({ ...run });
    }

    return merged
        .map((run) => {
            if (!run.text) return "";
            let html = escapeHtml(run.text);
            if (run.color && run.text.trim()) html = `<span style="color: ${run.color}">${html}</span>`;
            if (run.italic && run.text.trim()) html = `<em>${html}</em>`;
            if (run.bold && !inHeading && run.text.trim()) html = `<strong>${html}</strong>`;
            return html;
        })
        .join("");
}

function blocksToHtml(blocks: Block[]) {
    return blocks
        .map((block) => {
            if ("items" in block) {
                const items = block.items.map((runs) => `<li><p>${runsToHtml(runs, false)}</p></li>`);
                return `<${block.kind}>${items.join("")}</${block.kind}>`;
            }
            const style = block.align ? ` style="text-align: ${block.align}"` : "";
            if (block.kind === "h") {
                return `<h${block.level}${style}>${runsToHtml(block.runs, true).trim()}</h${block.level}>`;
            }
            return `<p${style}>${runsToHtml(block.runs, false).trim()}</p>`;
        })
        .join("");
}

/* ---------- main ---------- */

export async function pdfToHtml(data: ArrayBuffer): Promise<PdfImport> {
    const { getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(data));
    const { lines, pageWidth, hadImages } = await readLines(pdf);
    const { blocks } = buildBlocks(lines, pageWidth);

    const firstHeading = blocks.find((b) => b.kind === "h");
    const title =
        firstHeading?.kind === "h" ? lineText(firstHeading).replace(/\s+/g, " ").trim() : undefined;

    return { html: blocksToHtml(blocks), title, hadImages };
}