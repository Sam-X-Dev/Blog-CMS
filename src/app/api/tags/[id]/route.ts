import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { slugify } from "@/lib/slugify";
import { tagSchema } from "@/lib/validations/blog";

type Ctx = RouteContext<"/api/tags/[id]">;

// PUT /api/tags/:id. Body: { name }. Renames the tag everywhere.
export async function PUT(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const parsed = tagSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Invalid tag", 400, z.flattenError(parsed.error).fieldErrors);

  const slug = slugify(parsed.data.name);
  if (!slug)
    return fail("Use letters or numbers in the name", 400, { name: ["Use letters or numbers"] });
  try {
    const tag = await prisma.tag.update({ where: { id }, data: { name: parsed.data.name, slug } });
    return ok(tag, "Tag renamed");
  } catch (error) {
    return handleApiError(error, "Tag");
  }
}

// DELETE /api/tags/:id. Blogs keep existing; they just lose this tag.
export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await prisma.tag.delete({ where: { id } });
    return ok({ id }, "Tag deleted");
  } catch (error) {
    return handleApiError(error, "Tag");
  }
}
