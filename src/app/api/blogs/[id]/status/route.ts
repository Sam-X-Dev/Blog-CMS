import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { publishProblems } from "@/lib/blog-admin";
import { blogStatusSchema } from "@/lib/validations/blog";

// PATCH /api/blogs/:id/status. Body: { status: "PUBLISHED" | "DRAFT" }
// Quick publish / unpublish from the blog list, without opening the editor.
export async function PATCH(request: Request, ctx: RouteContext<"/api/blogs/[id]/status">) {
  const { id } = await ctx.params;

  const parsed = blogStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Status must be PUBLISHED or DRAFT", 400);
  const { status } = parsed.data;

  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
      select: { description: true, content: true, thumbnail: true, publishedAt: true },
    });
    if (!blog) return fail("Blog not found", 404);

    if (status === "PUBLISHED") {
      const missing = publishProblems(blog);
      if (missing.length) {
        return fail(`Add ${missing.join(", ")} before publishing. Open the blog with Edit.`, 400);
      }
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        status,
        publishedAt: status === "PUBLISHED" ? (blog.publishedAt ?? new Date()) : blog.publishedAt,
      },
      select: { id: true, status: true },
    });
    return ok(updated, status === "PUBLISHED" ? "Blog published" : "Blog moved to drafts");
  } catch (error) {
    return handleApiError(error, "Blog");
  }
}
