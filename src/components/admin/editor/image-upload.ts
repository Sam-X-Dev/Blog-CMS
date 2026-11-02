import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { altFromFileName, uploadImage } from "@/lib/media-upload";

/** Picture + an empty line after it, so typing next never replaces the picture */
export function imageNodes(src: string, alt: string | null) {
  return [{ type: "image", attrs: { src, alt: alt || null } }, { type: "paragraph" }];
}

/**
 * Uploads images (one after another, so they keep their order) and adds each to the blog.
 * `pos` = where they were dropped; without it they go where the cursor is.
 * Progress and errors show as toasts.
 */
export async function uploadIntoEditor(editor: Editor, files: File[], pos?: number) {
  const images = files.filter((f) => f.type.startsWith("image/"));
  let at = pos;

  for (const file of images) {
    const id = toast.loading(`Uploading ${file.name}…`);
    try {
      const item = await uploadImage(file, (p) =>
        toast.loading(`Uploading ${file.name}… ${p}%`, { id }),
      );
      const nodes = imageNodes(item.url, altFromFileName(file.name));
      if (at === undefined) {
        editor.chain().focus().insertContent(nodes).run();
      } else {
        editor.chain().focus().insertContentAt(at, nodes).run();
        at = editor.state.selection.to; // the next image goes after this one
      }
      toast.success("Image added", { id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed", { id });
    }
  }
}
