import Link from "next/link";

const linkClass =
    "border-brand-400 text-brand-900 hover:bg-brand-50 inline-flex min-h-11 items-center rounded-lg border px-4 text-small font-medium";
const disabledClass =
    "border-brand-200 text-brand-200 inline-flex min-h-11 items-center rounded-lg border px-4 text-small font-medium";

/**
 * Previous / Page X of Y / Next. Hidden when everything fits on one page.
 * Give `basePath` for simple lists, or `hrefFor` when the URL has other filters to keep.
 */
export function Pagination({
    page,
    totalPages,
    basePath = "",
    hrefFor,
}: {
    page: number;
    totalPages: number;
    basePath?: string;
    hrefFor?: (page: number) => string;
}) {
    if (totalPages <= 1) return null;
    const href = hrefFor ?? ((n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`));

    return (
        <nav aria-label="Pages" className="flex items-center justify-center gap-3">
            {page > 1 ? (
                <Link href={href(page - 1)} className={linkClass}>
                    ← Previous
                </Link>
            ) : (
                <span className={disabledClass}>← Previous</span>
            )}

            <span className="text-brand-muted text-small">
                Page {page} of {totalPages}
            </span>

            {page < totalPages ? (
                <Link href={href(page + 1)} className={linkClass}>
                    Next →
                </Link>
            ) : (
                <span className={disabledClass}>Next →</span>
            )}
        </nav>
    );
}