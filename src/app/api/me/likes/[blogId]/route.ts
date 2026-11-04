import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { findPublishedBlog } from "@/lib/engagement";
import { requireUserApi } from "@/lib/user-auth";

type Ctx = RouteContext<"/api/me/likes/[blogId]">;

// PUT /api/me/likes/:blogId — like a blog (doing it twice is fine).
export async function PUT(_request: Request, ctx: Ctx) {
  const { user, denied } = await requireUserApi();
  if (denied) return denied;
  try {
    const { blogId } = await ctx.params;
    if (!(await findPublishedBlog(blogId))) return fail("Blog not found", 404);
    await prisma.blogLike.upsert({
      where: { userId_blogId: { userId: user.userId, blogId } },
      update: {},
      create: { userId: user.userId, blogId },
    });
    const likes = await prisma.blogLike.count({ where: { blogId } });
    return ok({ liked: true, likes }, "Liked");
  } catch (error) {
    return handleApiError(error, "Like");
  }
}

// DELETE /api/me/likes/:blogId — remove the like.
export async function DELETE(_request: Request, ctx: Ctx) {
  const { user, denied } = await requireUserApi();
  if (denied) return denied;
  try {
    const { blogId } = await ctx.params;
    await prisma.blogLike.deleteMany({ where: { userId: user.userId, blogId } });
    const likes = await prisma.blogLike.count({ where: { blogId } });
    return ok({ liked: false, likes }, "Like removed");
  } catch (error) {
    return handleApiError(error, "Like");
  }
}
