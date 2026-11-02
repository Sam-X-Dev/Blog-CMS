import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { recordView } from "@/lib/views";

const viewSchema = z.object({ blogId: z.string().min(1).max(50) });

// POST /api/views — public. Body: { blogId }. Called by <ViewTracker /> when a blog page opens.
export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const parsed = viewSchema.safeParse(body);
    if (!parsed.success) return fail("blogId is required", 400);

    try {
        const { blogId } = parsed.data;
        // Only published blogs can get views
        const blog = await prisma.blog.findFirst({
            where: { id: blogId, status: "PUBLISHED" },
            select: { id: true },
        });
        if (!blog) return fail("Blog not found", 404);

        await recordView(blogId);
        return ok(null, "View counted");
    } catch (error) {
        return handleApiError(error, "View");
    }
}