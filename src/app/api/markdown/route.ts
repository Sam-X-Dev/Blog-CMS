import { fail, ok } from "@/lib/api-response";
import { parseMarkdown } from "@/lib/markdown";
import { sanitizeBlogHtml } from "@/lib/sanitize";

const MAX_BYTES = 1024 * 1024; // 1 MB is plenty for a text file

// POST /api/markdown — admin only (protect in proxy.ts)
// Body: multipart/form-data with one field "file" (.md or .markdown).
// Returns { html, title?, description? }. The HTML is already cleaned (no scripts etc.).
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return fail('Send the file as form-data in a field called "file"', 400, {
      file: ["No file was sent"],
    });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext !== "md" && ext !== "markdown") {
    return fail("Only .md files can be converted", 400, { file: ["Not a Markdown file"] });
  }
  if (file.size > MAX_BYTES) {
    return fail("File is too large (max 1 MB)", 413, { file: ["File is too large"] });
  }

  const text = await file.text();
  if (!text.trim()) return fail("This file is empty", 400, { file: ["Empty file"] });

  const { html, title, description } = parseMarkdown(text);
  return ok(
    { html: sanitizeBlogHtml(html), title, description },
    "Markdown converted successfully"
  );
}
