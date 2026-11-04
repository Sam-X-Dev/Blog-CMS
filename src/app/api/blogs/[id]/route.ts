import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { BlogInputError, toBlogData } from "@/lib/blog-admin";
import { blogInputSchema } from "@/lib/validations/blog";
import { requireAdminApi } from "@/lib/auth";

type Ctx = RouteContext<"/api/blogs/[id]">;

// GET /api/blogs/:id. Everything the edit form needs.
export async function GET(_request: Request, ctx: Ctx) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        tags: { select: { name: true, slug: true } },
      },
    });
    if (!blog) return fail("Blog not found", 404);
    return ok(blog, "Blog fetched successfully");
  } catch (error) {
    return handleApiError(error, "Blog");
  }
}

// PUT /api/blogs/:id. Updates THIS blog (never creates a new one).
// The URL (slug) stays the same unless the admin typed a different one.
export async function PUT(request: Request, ctx: Ctx) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await ctx.params;

  const body = await request.json().catch(() => null);
  if (!body) return fail("Request body must be valid JSON", 400);
  const parsed = blogInputSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields", 400, z.flattenError(parsed.error).fieldErrors);
  }
  const input = parsed.data;

  try {
    const existing = await prisma.blog.findUnique({
      where: { id },
      select: { id: true, slug: true, publishedAt: true },
    });
    if (!existing) return fail("Blog not found. It may have been deleted.", 404);

    let slug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      const taken = await prisma.blog.findFirst({
        where: { slug: input.slug, id: { not: id } },
        select: { id: true },
      });
      if (taken) {
        return fail("This URL is already used by another blog", 409, {
          slug: ["Already used by another blog. Change it a little."],
        });
      }
      slug = input.slug;
    }

    const { tagsConnect, ...data } = await toBlogData(input);
    const blog = await prisma.blog.update({
      where: { id },
      data: {
        ...data,
        slug,
        // First publish sets the date; later updates and re-publishing keep the original date
        publishedAt:
          input.status === "PUBLISHED"
            ? (existing.publishedAt ?? new Date())
            : existing.publishedAt,
        tags: { set: [], connectOrCreate: tagsConnect },
      },
      select: { id: true, slug: true, status: true, updatedAt: true },
    });
    return ok(blog, input.status === "PUBLISHED" ? "Blog updated" : "Draft saved");
  } catch (error) {
    if (error instanceof BlogInputError) return fail(error.message, error.status, error.errors);
    return handleApiError(error, "Blog");
  }
}

// DELETE /api/blogs/:id. Deletes the blog (its view counts go with it).
export async function DELETE(_request: Request, ctx: Ctx) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    await prisma.blog.delete({ where: { id } });
    return ok({ id }, "Blog deleted");
  } catch (error) {
    return handleApiError(error, "Blog");
  }
}
