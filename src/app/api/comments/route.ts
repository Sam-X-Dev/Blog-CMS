import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { findPublishedBlog } from "@/lib/engagement";
import { createLimiter } from "@/lib/rate-limit";
import { getBlogComments } from "@/lib/queries/comments";
import { getUser, requireUserApi } from "@/lib/user-auth";
import { commentSchema } from "@/lib/validations/user";

// Max 5 comments per reader per minute (stops spam)
const posting = createLimiter(5, 60 * 1000);

// GET /api/comments?blogId=... — comments on a published blog, newest first.
export async function GET(request: Request) {
  try {
    const blogId = new URL(request.url).searchParams.get("blogId") ?? "";
    if (!blogId || !(await findPublishedBlog(blogId))) return fail("Blog not found", 404);
    const user = await getUser();
    return ok(await getBlogComments(blogId, user?.userId));
  } catch (error) {
    return handleApiError(error, "Comments");
  }
}

// POST /api/comments — Body: { blogId, content }. Logged-in readers only.
export async function POST(request: Request) {
  const { user, denied } = await requireUserApi();
  if (denied) return denied;

  const parsed = commentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return fail("Please fix your comment", 400, z.flattenError(parsed.error).fieldErrors);
  }
  if (posting.limited(user.userId)) {
    return fail("You're commenting too fast. Please wait a minute.", 429);
  }

  try {
    const { blogId, content } = parsed.data;
    if (!(await findPublishedBlog(blogId))) return fail("Blog not found", 404);
    const comment = await prisma.comment.create({
      data: { blogId, content, userId: user.userId },
      select: { id: true, content: true, createdAt: true, user: { select: { name: true } } },
    });
    posting.hit(user.userId);
    return ok({ ...comment, mine: true }, "Comment posted", 201);
  } catch (error) {
    return handleApiError(error, "Comment");
  }
}
