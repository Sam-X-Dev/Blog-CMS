import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";

const featuredSchema = z.object({ isFeatured: z.boolean() });

// PATCH /api/featured/:id — admin (login check: Samarth)
// Body: { isFeatured: true | false }. The newest featured blog becomes the homepage hero.
export async function PATCH(request: Request, ctx: RouteContext<"/api/featured/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = featuredSchema.safeParse(body);
  if (!parsed.success) return fail("isFeatured must be true or false", 400);

  try {
    const blog = await prisma.blog.update({
      where: { id },
      data: { isFeatured: parsed.data.isFeatured },
      select: { id: true, isFeatured: true },
    });
    return ok(blog, blog.isFeatured ? "Featured on the homepage" : "Removed from the homepage");
  } catch (error) {
    return handleApiError(error, "Blog");
  }
}
