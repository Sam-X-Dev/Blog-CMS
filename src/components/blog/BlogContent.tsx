import { BLOG_PROSE_CLASS } from "@/lib/editor-options";
import { optimizeContentImages } from "@/lib/cloudinary-url";

type BlogContentProps = {
  /** Blog HTML. On the public site, pass HTML that went through sanitizeBlogHtml() on the server. */
  html: string;
  className?: string;
};

/**
 * Shows blog content with the blog typography.
 * Used in the editor's Preview and on the public blog page (Samarth),
 * so both look exactly the same. Pictures load lazily and Cloudinary ones are compressed.
 */
export function BlogContent({ html, className = "" }: BlogContentProps) {
  return (
    <div
      className={`${BLOG_PROSE_CLASS} ${className}`}
      dangerouslySetInnerHTML={{ __html: optimizeContentImages(html) }}
    />
  );
}
