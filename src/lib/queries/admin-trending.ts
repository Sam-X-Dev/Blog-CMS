import "server-only";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { istDay, TRENDING_DAYS } from "@/lib/views";

export type AdminTrendingRow = {
    id: string;
    title: string;
    slug: string;
    category: string | null;
    isTrending: boolean;
    isFeatured: boolean;
    weekViews: number;
};

/** All published blogs with their pick status and views this week (most viewed first). */
export async function getAdminTrendingList(): Promise<AdminTrendingRow[]> {
    await connection();

    const [blogs, views] = await Promise.all([
        prisma.blog.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { publishedAt: { sort: "desc", nulls: "last" } },
            select: {
                id: true,
                title: true,
                slug: true,
                isTrending: true,
                isFeatured: true,
                category: { select: { name: true } },
            },
        }),
        prisma.blogView.groupBy({
            by: ["blogId"],
            where: { day: { gte: istDay(TRENDING_DAYS - 1) } },
            _sum: { count: true },
        }),
    ]);

    const viewsById = new Map(views.map((v) => [v.blogId, v._sum.count ?? 0]));

    return blogs
        .map(({ category, ...b }) => ({
            ...b,
            category: category?.name ?? null,
            weekViews: viewsById.get(b.id) ?? 0,
        }))
        .sort((a, b) => b.weekViews - a.weekViews);
}