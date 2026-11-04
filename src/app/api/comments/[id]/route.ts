import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { getAdmin } from "@/lib/auth";
import { getUser } from "@/lib/user-auth";

// DELETE /api/comments/:id — the reader who wrote it, or the admin, can delete a comment.
export async function DELETE(_request: Request, ctx: RouteContext<"/api/comments/[id]">) {
  const [admin, user] = await Promise.all([getAdmin(), getUser()]);
  if (!admin && !user) return fail("Please log in first", 401);

  try {
    const { id } = await ctx.params;
    const comment = await prisma.comment.findUnique({ where: { id }, select: { userId: true } });
    if (!comment) return fail("Comment not found", 404);
    if (!admin && comment.userId !== user?.userId) {
      return fail("You can only delete your own comments", 403);
    }
    await prisma.comment.delete({ where: { id } });
    return ok({ id }, "Comment deleted");
  } catch (error) {
    return handleApiError(error, "Comment");
  }
}
