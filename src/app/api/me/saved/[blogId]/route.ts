import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { findPublishedBlog } from "@/lib/engagement";
import { requireUserApi } from "@/lib/user-auth";

type Ctx = RouteContext<"/api/me/saved/[blogId]">;

// PUT /api/me/saved/:blogId — save a blog to read later.
export async function PUT(_request: Request, ctx: Ctx) {
  const { user, denied } = await requireUserApi();
  if (denied) return denied;
  try {
    const { blogId } = await ctx.params;
    if (!(await findPublishedBlog(blogId))) return fail("Blog not found", 404);
    await prisma.savedBlog.upsert({
      where: { userId_blogId: { userId: user.userId, blogId } },
      update: {},
      create: { userId: user.userId, blogId },
    });
    return ok({ saved: true }, "Saved to your list");
  } catch (error) {
    return handleApiError(error, "Saved blog");
  }
}

// DELETE /api/me/saved/:blogId — remove it from the saved list.
export async function DELETE(_request: Request, ctx: Ctx) {
  const { user, denied } = await requireUserApi();
  if (denied) return denied;
  try {
    const { blogId } = await ctx.params;
    await prisma.savedBlog.deleteMany({ where: { userId: user.userId, blogId } });
    return ok({ saved: false }, "Removed from your list");
  } catch (error) {
    return handleApiError(error, "Saved blog");
  }
}
