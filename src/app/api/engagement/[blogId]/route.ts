import { fail, handleApiError, ok } from "@/lib/api-response";
import { findPublishedBlog, getEngagement } from "@/lib/engagement";
import { getUser } from "@/lib/user-auth";

// GET /api/engagement/:blogId — like + comment counts, and liked/saved for the logged-in reader.
export async function GET(_request: Request, ctx: RouteContext<"/api/engagement/[blogId]">) {
  try {
    const { blogId } = await ctx.params;
    if (!(await findPublishedBlog(blogId))) return fail("Blog not found", 404);
    const user = await getUser();
    return ok({ ...(await getEngagement(blogId, user?.userId)), loggedIn: Boolean(user) });
  } catch (error) {
    return handleApiError(error, "Blog");
  }
}
