import "server-only";
import { connection } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { istDay, TRENDING_DAYS } from "@/lib/views";

// Data for the admin panel (drafts included).

import { ADMIN_SORTS, type AdminSort } from "@/lib/admin-sorts";
export type AdminStatusFilter = "all" | "published" | "draft";

export type AdminBlogQuery = {
  q: string;
  status: AdminStatusFilter;
  category: string; // category id, "none" for uncategorised, "" for all
  sort: AdminSort;
  page: number;
};

const PER_PAGE = 20;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** URL search params → a safe query (unknown values fall back to defaults). */
export function parseAdminBlogQuery(
  params: Record<string, string | string[] | undefined>
): AdminBlogQuery {
  const status = first(params.status);
  const sort = first(params.sort);
  const page = Number(first(params.page));
  return {
    q: first(params.q).trim().slice(0, 100),
    status: status === "published" || status === "draft" ? status : "all",
    category: first(params.category).slice(0, 50),
    sort: ADMIN_SORTS.some((s) => s.id === sort) ? (sort as AdminSort) : "updated",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export type AdminBlogRow = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  thumbnail: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  isFeatured: boolean;
  isTrending: boolean;
  category: { id: string; name: string } | null;
  tags: { name: string }[];
};

/** The blog table: search (title, slug, description, tags), filter, sort, 20 per page. */
export async function listAdminBlogs(query: AdminBlogQuery) {
  const { q, status, category, sort, page } = query;

  const where: Prisma.BlogWhereInput = {
    ...(status === "published"
      ? { status: "PUBLISHED" }
      : status === "draft"
        ? { status: "DRAFT" }
        : {}),
    ...(category === "none" ? { categoryId: null } : category ? { categoryId: category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.BlogOrderByWithRelationInput[] =
    sort === "newest"
      ? [{ createdAt: "desc" }]
      : sort === "oldest"
        ? [{ createdAt: "asc" }]
        : sort === "title"
          ? [{ title: "asc" }]
          : [{ updatedAt: "desc" }];

  const [total, blogs] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      orderBy,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        thumbnail: true,
        publishedAt: true,
        updatedAt: true,
        createdAt: true,
        isFeatured: true,
        isTrending: true,
        category: { select: { id: true, name: true } },
        tags: { select: { name: true }, orderBy: { name: "asc" } },
      },
    }),
  ]);

  return {
    blogs: blogs as AdminBlogRow[],
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}

/** Numbers and lists for the dashboard. */
export async function getDashboardData() {
  await connection();
  const weekStart = istDay(TRENDING_DAYS - 1);

  const [
    total,
    published,
    drafts,
    categories,
    tags,
    media,
    weekViews,
    allViews,
    recent,
    topWeek,
    noThumb,
    readers,
    comments,
    likes,
    saves,
  ] = await Promise.all([
    prisma.blog.count(),
    prisma.blog.count({ where: { status: "PUBLISHED" } }),
    prisma.blog.count({ where: { status: "DRAFT" } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.media.count(),
    prisma.blogView.aggregate({ _sum: { count: true }, where: { day: { gte: weekStart } } }),
    prisma.blogView.aggregate({ _sum: { count: true } }),
    prisma.blog.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, title: true, slug: true, status: true, updatedAt: true },
    }),
    prisma.blogView.groupBy({
      by: ["blogId"],
      where: { day: { gte: weekStart } },
      _sum: { count: true },
      orderBy: { _sum: { count: "desc" } },
      take: 5,
    }),
    prisma.blog.count({ where: { status: "DRAFT", thumbnail: null } }),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.blogLike.count(),
    prisma.savedBlog.count(),
  ]);

  const topBlogs = topWeek.length
    ? await prisma.blog.findMany({
        where: { id: { in: topWeek.map((t) => t.blogId) } },
        select: { id: true, title: true, slug: true },
      })
    : [];
  const byId = new Map(topBlogs.map((b) => [b.id, b]));

  return {
    stats: {
      total,
      published,
      drafts,
      categories,
      tags,
      media,
      weekViews: weekViews._sum.count ?? 0,
      allViews: allViews._sum.count ?? 0,
      draftsWithoutThumbnail: noThumb,
      readers,
      comments,
      likes,
      saves,
    },
    recent,
    topThisWeek: topWeek.flatMap((t) => {
      const blog = byId.get(t.blogId);
      return blog ? [{ ...blog, views: t._sum.count ?? 0 }] : [];
    }),
  };
}

/** One blog with everything the edit form needs, or null. */
export async function getBlogForEdit(id: string) {
  return prisma.blog.findUnique({
    where: { id },
    include: {
      tags: { select: { name: true }, orderBy: { name: "asc" } },
      category: { select: { id: true, name: true } },
    },
  });
}

/** Categories for the filter dropdown. */
export async function getAdminCategoryOptions() {
  return prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}

/** Tag names for suggestions in the tag box. */
export async function getTagNames() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } });
  return tags.map((t) => t.name);
}
