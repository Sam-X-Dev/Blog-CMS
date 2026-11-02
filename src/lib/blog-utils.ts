// Small helpers for showing blogs on the public site.
// Safe to use in both server and client components.

/** Link to one blog's page. Change it here if the blog page URL changes. */
export function blogPath(slug: string) {
    return `/blog/${slug}`;
}

/** Link to one category's page (all its blogs). */
export function categoryPath(slug: string) {
    return `/categories/${slug}`;
}

/** Link to the Trending page, optionally for one category. */
export function trendingPath(categorySlug?: string) {
    return categorySlug ? `/trending?category=${encodeURIComponent(categorySlug)}` : "/trending";
}

/** "?page=3" -> 3. Anything missing or invalid -> 1. */
export function toPageNumber(value: string | string[] | undefined) {
    const n = Number(Array.isArray(value) ? value[0] : value);
    return Number.isInteger(n) && n > 0 ? n : 1;
}

/** About how many minutes it takes to read the blog (200 words per minute, at least 1). */
export function readingTime(html: string) {
    const words = html
        .replace(/<[^>]*>/g, " ")
        .split(/\s+/)
        .filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

const dateFormat = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
});

/** 2026-10-13T06:30:00Z -> "13 October 2026" */
export function formatDate(date: Date | string) {
    return dateFormat.format(new Date(date));
}

/** How the /blogs list can be sorted. The first one is the default. */
export const BLOG_SORTS = [
    { id: "newest", label: "Newest" },
    { id: "oldest", label: "Oldest" },
    { id: "popular", label: "Most read" },
] as const;

export type BlogSort = (typeof BLOG_SORTS)[number]["id"];

/** "?sort=oldest" -> "oldest". Anything missing or unknown -> "newest". */
export function toSort(value: string | string[] | undefined): BlogSort {
    const v = Array.isArray(value) ? value[0] : value;
    return BLOG_SORTS.find((s) => s.id === v)?.id ?? "newest";
}

/** "?q=  react " -> "react". Missing -> "". Long text is cut to 100 characters. */
export function toSearchText(value: string | string[] | undefined) {
    const v = Array.isArray(value) ? value[0] : value;
    return (v ?? "").trim().slice(0, 100);
}

export type BlogsQuery = { q?: string; category?: string; sort?: BlogSort; page?: number };

/**
 * Link to the all-blogs page with search, filter, sort and page.
 * Leaves out defaults so links stay short: { q: "react" } -> "/blogs?q=react"
 */
export function blogsPath({ q, category, sort, page }: BlogsQuery = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page && page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/blogs?${query}` : "/blogs";
}