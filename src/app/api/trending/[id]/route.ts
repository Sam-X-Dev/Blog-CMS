import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";

const trendingSchema = z.object({ isTrending: z.boolean() });

// PATCH /api/trending/:id — admin only (protected by Samarth's proxy.ts)
// Body: { isTrending: true | false }
export async function PATCH(request: Request, ctx: RouteContext<"/api/trending/[id]">) {
    const { id } = await ctx.params;
    const body = await request.json().catch(() => null);
    const parsed = trendingSchema.safeParse(body);
    if (!parsed.success) return fail("isTrending must be true or false", 400);

    try {
        const blog = await prisma.blog.update({
            where: { id },
            data: { isTrending: parsed.data.isTrending },
            select: { id: true, isTrending: true },
        });
        return ok(blog, blog.isTrending ? "Added to Trending" : "Removed from Trending");
    } catch (error) {
        return handleApiError(error, "Blog");
    }
}