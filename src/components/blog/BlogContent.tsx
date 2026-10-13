import { BLOG_PROSE_CLASS, GOOGLE_FONTS_URL } from "@/lib/editor-options";

type BlogContentProps = {
    /** Blog HTML. On the public site, pass HTML that went through sanitizeBlogHtml() on the server. */
    html: string;
    className?: string;
};

/**
 * Shows blog content with the blog typography.
 * Used in the editor's Preview and on the public blog page (Samarth),
 * so both look exactly the same.
 */
export function BlogContent({ html, className = "" }: BlogContentProps) {
    return (
        <>
            {/* React 19 moves this into <head> and loads it only once */}
            <link rel="stylesheet" href={GOOGLE_FONTS_URL} precedence="default" />
            <div
                className={`${BLOG_PROSE_CLASS} ${className}`}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </>
    );
}