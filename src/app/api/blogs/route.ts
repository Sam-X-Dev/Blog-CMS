import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { BlogInputError, toBlogData, uniqueSlug } from "@/lib/blog-admin";
import { listAdminBlogs, parseAdminBlogQuery } from "@/lib/queries/admin-blogs";
import { blogInputSchema } from "@/lib/validations/blog";

// GET /api/blogs?q=&status=all|published|draft&category=<id>&sort=updated|newest|oldest|title&page=
// All blogs (drafts too), 20 per page.
export async function GET(request: Request) {
  try {
    const query = parseAdminBlogQuery(Object.fromEntries(new URL(request.url).searchParams));
    return ok(await listAdminBlogs(query), "Blogs fetched successfully");
  } catch (error) {
    return handleApiError(error, "Blog");
  }
}

// POST /api/blogs. Creates a blog (draft or published).
// Body: { title, slug?, description, content, thumbnail, categoryId, tags[], seoTitle, seoDescription, status }
export async function POST(request: Request) {

  const body = await request.json().catch(() => null);
  if (!body) return fail("Request body must be valid JSON", 400);
  const parsed = blogInputSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields", 400, z.flattenError(parsed.error).fieldErrors);
  }
  const input = parsed.data;

  try {
    // A slug the admin typed must be free; an automatic one gets -2, -3... if needed
    let slug: string;
    if (input.slug) {
      const taken = await prisma.blog.findUnique({
        where: { slug: input.slug },
        select: { id: true },
      });
      if (taken) {
        return fail("This URL is already used by another blog", 409, {
          slug: ["Already used by another blog. Change it a little."],
        });
      }
      slug = input.slug;
    } else {
      slug = await uniqueSlug(input.title);
    }

    const { tagsConnect, ...data } = await toBlogData(input);
    const blog = await prisma.blog.create({
      data: {
        ...data,
        slug,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        tags: { connectOrCreate: tagsConnect },
      },
      select: { id: true, slug: true, status: true },
    });
    return ok(blog, input.status === "PUBLISHED" ? "Blog published" : "Draft saved", 201);
  } catch (error) {
    if (error instanceof BlogInputError) return fail(error.message, error.status, error.errors);
    return handleApiError(error, "Blog");
  }
}
