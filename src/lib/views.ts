import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Today's date in India (0) or N days ago, as a plain date for the BlogView.day column. */
export function istDay(daysAgo = 0) {
    const day = new Date(Date.now() + IST_OFFSET_MS);
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - daysAgo);
    return day;
}

/** Trending looks at today + the 6 days before it. */
export const TRENDING_DAYS = 7;

/** Adds 1 to today's view count for this blog. */
export async function recordView(blogId: string) {
    const day = istDay();
    try {
        await prisma.blogView.upsert({
            where: { blogId_day: { blogId, day } },
            create: { blogId, day, count: 1 },
            update: { count: { increment: 1 } },
        });
    } catch (error) {
        // Two readers opened the blog at the same moment and both tried to create today's row
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            await prisma.blogView.update({
                where: { blogId_day: { blogId, day } },
                data: { count: { increment: 1 } },
            });
            return;
        }
        throw error;
    }
}