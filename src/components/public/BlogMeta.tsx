import { formatDate } from "@/lib/blog-utils";

/** "13 October 2026 · 4 min read" */
export function BlogMeta({
    publishedAt,
    readMinutes,
}: {
    publishedAt: Date | null;
    readMinutes: number;
}) {
    return (
        <p className="text-brand-muted text-small">
            {publishedAt && (
                <>
                    <time dateTime={new Date(publishedAt).toISOString()}>{formatDate(publishedAt)}</time>
                    <span aria-hidden> · </span>
                </>
            )}
            {readMinutes} min read
        </p>
    );
}