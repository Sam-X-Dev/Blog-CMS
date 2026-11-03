import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { readingTime, type BlogSort } from "@/lib/blog-utils";
import { istDay, TRENDING_DAYS } from "@/lib/views";

/** Everything a blog card needs (no full content, so pages stay light). */
export type BlogCardData = {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    publishedAt: Date | null;
    readMinutes: number;
    category: { name: string; slug: string } | null;
};

export type TrendingBlog = BlogCardData & { weekViews: number };

export type CategoryWithCount = {
    id: string;
    name: string;
    slug: string;
    count: number;
};

/** Columns every blog card reads from the database */
const CARD_SELECT = {
    id: true,
    title: true,
    slug: true,
    description: true,
    thumbnail: true,
    publishedAt: true,
    content: true,
    category: { select: { name: true, slug: true } },
} as const;

type CardRow = {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    publishedAt: Date | null;
    content: string;
    category: { name: string; slug: string } | null;
};

function toCard({ content, ...blog }: CardRow): BlogCardData {
    return { ...blog, readMinutes: readingTime(content) };
}

const NEWEST_FIRST = [
    { publishedAt: { sort: "desc", nulls: "last" } },
    { createdAt: "desc" },
] as const;

/** Only published blogs, optionally inside one category and/or with one tag */
function publishedIn(categorySlug?: string, tagSlug?: string) {
    return {
        status: "PUBLISHED" as const,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(tagSlug ? { tags: { some: { slug: tagSlug } } } : {}),
    };
}

/** Newest published blogs first. Drafts are never shown. */
export async function getLatestBlogs(limit = 7): Promise<BlogCardData[]> {
    // Read fresh data on every visit (not frozen at build time)
    await connection();

    const blogs = await prisma.blog.findMany({
        where: publishedIn(),
        orderBy: [...NEWEST_FIRST],
        take: limit,
        select: CARD_SELECT,
    });
    return blogs.map(toCard);
}

/**
 * Homepage: the featured blog (newest admin pick, or simply the newest blog if nothing is picked)
 * and the latest blogs after it. The featured blog is never repeated in "latest".
 */
export async function getHomeBlogs(latestCount = 6): Promise<{
    featured: BlogCardData | null;
    latest: BlogCardData[];
}> {
    await connection();

    const [pick, newest] = await Promise.all([
        prisma.blog.findFirst({
            where: { ...publishedIn(), isFeatured: true },
            orderBy: [...NEWEST_FIRST],
            select: CARD_SELECT,
        }),
        prisma.blog.findMany({
            where: publishedIn(),
            orderBy: [...NEWEST_FIRST],
            take: latestCount + 1,
            select: CARD_SELECT,
        }),
    ]);

    const featured = pick ?? newest[0] ?? null;
    const latest = newest.filter((b) => b.id !== featured?.id).slice(0, latestCount);
    return { featured: featured ? toCard(featured) : null, latest: latest.map(toCard) };
}

/**
 * One published blog for its own page, or null (drafts and unknown slugs → 404).
 * cache(): the page and its <title> both ask for it, the database is hit once per visit.
 */
export const getPublishedBlog = cache(async (slug: string) => {
    await connection();
    const blog = await prisma.blog.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            content: true,
            thumbnail: true,
            publishedAt: true,
            updatedAt: true,
            seoTitle: true,
            seoDescription: true,
            category: { select: { name: true, slug: true } },
            tags: { select: { name: true, slug: true }, orderBy: { name: "asc" } },
        },
    });
    return blog ? { ...blog, readMinutes: readingTime(blog.content) } : null;
});

/** "Keep reading": newest blogs from the same category, topped up with the newest overall. */
export async function getRelatedBlogs(
    blogId: string,
    categorySlug?: string,
    limit = 3,
): Promise<BlogCardData[]> {
    await connection();
    const sameCategory = categorySlug
        ? await prisma.blog.findMany({
            where: { ...publishedIn(categorySlug), id: { not: blogId } },
            orderBy: [...NEWEST_FIRST],
            take: limit,
            select: CARD_SELECT,
        })
        : [];
    const missing = limit - sameCategory.length;
    const others =
        missing > 0
            ? await prisma.blog.findMany({
                where: { ...publishedIn(), id: { notIn: [blogId, ...sameCategory.map((b) => b.id)] } },
                orderBy: [...NEWEST_FIRST],
                take: missing,
                select: CARD_SELECT,
            })
            : [];
    return [...sameCategory, ...others].map(toCard);
}

/** A tag by its slug (for the "tagged ..." filter on /blogs). Null if it doesn't exist. */
export async function getTagBySlug(slug: string) {
    return prisma.tag.findUnique({ where: { slug }, select: { name: true, slug: true } });
}

/**
 * Categories that have at least one published blog, with how many.
 * cache(): the page and the footer can both ask for it, the database is hit once per visit.
 */
export const getCategoriesWithBlogs = cache(async (): Promise<CategoryWithCount[]> => {
    await connection();

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        select: {
            id: true,
            name: true,
            slug: true,
            _count: { select: { blogs: { where: { status: "PUBLISHED" } } } },
        },
    });

    return categories
        .filter((c) => c._count.blogs > 0)
        .map(({ _count, ...c }) => ({ ...c, count: _count.blogs }));
});

/** For the footer: how many published blogs there are and when the newest one came out. */
export async function getSiteStats() {
  await connection();
  const [blogs, newest] = await Promise.all([
    prisma.blog.count({ where: publishedIn() }),
    prisma.blog.findFirst({
      where: publishedIn(),
      orderBy: [...NEWEST_FIRST],
      select: { publishedAt: true },
    }),
  ]);
  return { blogs, lastPublished: newest?.publishedAt ?? null };
}

export async function getCategoryBySlug(slug: string) {
    await connection();
    return prisma.category.findUnique({
        where: { slug },
        select: { id: true, name: true, slug: true },
    });
}

/** One page of a category's published blogs, newest first. */
export async function getCategoryBlogs(categorySlug: string, page: number, perPage = 9) {
    await connection();

    const where = publishedIn(categorySlug);
    const [blogs, total] = await Promise.all([
        prisma.blog.findMany({
            where,
            orderBy: [...NEWEST_FIRST],
            skip: (page - 1) * perPage,
            take: perPage,
            select: CARD_SELECT,
        }),
        prisma.blog.count({ where }),
    ]);

    return { blogs: blogs.map(toCard), total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

/** Blogs the admin marked as Trending (Editor's picks). */
export async function getTrendingPicks(categorySlug?: string, limit = 6): Promise<BlogCardData[]> {
    await connection();

    const blogs = await prisma.blog.findMany({
        where: { ...publishedIn(categorySlug), isTrending: true },
        orderBy: [...NEWEST_FIRST],
        take: limit,
        select: CARD_SELECT,
    });
    return blogs.map(toCard);
}

/** Most opened blogs in the last 7 days, with their view count. */
export async function getMostReadThisWeek(
    categorySlug?: string,
    limit = 10,
): Promise<TrendingBlog[]> {
    await connection();

    // 1. Add up each blog's daily views for the last 7 days and keep the top ones
    const ranked = await prisma.blogView.groupBy({
        by: ["blogId"],
        where: { day: { gte: istDay(TRENDING_DAYS - 1) }, blog: publishedIn(categorySlug) },
        _sum: { count: true },
        orderBy: { _sum: { count: "desc" } },
        take: limit,
    });
    if (ranked.length === 0) return [];

    // 2. Load those blogs and put them back in ranking order
    const blogs = await prisma.blog.findMany({
        where: { id: { in: ranked.map((r) => r.blogId) } },
        select: CARD_SELECT,
    });
    const byId = new Map(blogs.map((b) => [b.id, b]));

    return ranked.flatMap((r) => {
        const blog = byId.get(r.blogId);
        return blog ? [{ ...toCard(blog), weekViews: r._sum.count ?? 0 }] : [];
    });
}

/**
 * The all-blogs page: search (title, description, tags, category name),
 * filter by category and tag, sort, and one page of results.
 */
export async function searchBlogs({
    q,
    categorySlug,
    tagSlug,
    sort,
    page,
    perPage = 9,
}: {
    q: string;
    categorySlug?: string;
    tagSlug?: string;
    sort: BlogSort;
    page: number;
    perPage?: number;
}) {
    await connection();

    const where = {
        ...publishedIn(categorySlug, tagSlug),
        ...(q
            ? {
                OR: [
                    { title: { contains: q, mode: "insensitive" as const } },
                    { description: { contains: q, mode: "insensitive" as const } },
                    { tags: { some: { name: { contains: q, mode: "insensitive" as const } } } },
                    { category: { name: { contains: q, mode: "insensitive" as const } } },
                ],
            }
            : {}),
    };

    const skip = (page - 1) * perPage;
    const total = await prisma.blog.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    let blogs: CardRow[];
    if (sort === "popular") {
        blogs = await mostReadFirst(where, skip, perPage);
    } else {
        blogs = await prisma.blog.findMany({
            where,
            orderBy:
                sort === "oldest"
                    ? [{ publishedAt: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }]
                    : [...NEWEST_FIRST],
            skip,
            take: perPage,
            select: CARD_SELECT,
        });
    }

    return { blogs: blogs.map(toCard), total, totalPages };
}

/**
 * "Most read" sort: blogs with the most views in the last 7 days first,
 * then the ones nobody opened this week (newest first).
 */
async function mostReadFirst(
    where: Prisma.BlogWhereInput,
    skip: number,
    take: number,
): Promise<CardRow[]> {
    const ranked = await prisma.blogView.groupBy({
        by: ["blogId"],
        where: { day: { gte: istDay(TRENDING_DAYS - 1) }, blog: where },
        _sum: { count: true },
        orderBy: { _sum: { count: "desc" } },
    });
    const rankedIds = ranked.map((r) => r.blogId);

    // Part of this page that comes from the ranked (viewed) blogs
    const pageIds = rankedIds.slice(skip, skip + take);
    const viewed = pageIds.length
        ? await prisma.blog.findMany({ where: { id: { in: pageIds } }, select: CARD_SELECT })
        : [];
    const byId = new Map(viewed.map((b) => [b.id, b]));
    const result = pageIds.flatMap((id) => byId.get(id) ?? []);

    // Fill the rest of the page with blogs that had no views this week
    const missing = take - result.length;
    if (missing > 0) {
        const rest = await prisma.blog.findMany({
            where: { AND: [where, { id: { notIn: rankedIds } }] },
            orderBy: [...NEWEST_FIRST],
            skip: Math.max(0, skip - rankedIds.length),
            take: missing,
            select: CARD_SELECT,
        });
        result.push(...rest);
    }
    return result;
}