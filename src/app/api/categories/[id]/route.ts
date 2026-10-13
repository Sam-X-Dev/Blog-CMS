// GET is public (used by filters and the blog form). POST/PUT/DELETE become admin-only once Samarth adds proxy.ts (Next 16's replacement for middleware.ts).

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleApiError } from "@/lib/api-response";
import { categorySchema } from "@/lib/validations/category";
import { slugify } from "@/lib/slugify";

export async function GET(_request: Request, ctx: RouteContext<"/api/categories/[id]">) {
  try {
    const { id } = await ctx.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { blogs: true },
        },
      },
    });

    if (!category) {
      return fail("Category not found", 404);
    }

    return ok(category, "Category fetched successfully");
  } catch (error) {
    return handleApiError(error, "Category");
  }
}

export async function PUT(request: Request, ctx: RouteContext<"/api/categories/[id]">) {
  try {
    const { id } = await ctx.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail("Request body must be valid JSON", 400);
    }

    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return fail("Invalid category data", 400, z.flattenError(validation.error).fieldErrors);
    }

    const { name } = validation.data;
    const slug = slugify(name);

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
      },
      include: {
        _count: {
          select: { blogs: true },
        },
      },
    });

    return ok(category, "Category updated successfully");
  } catch (error) {
    return handleApiError(error, "Category");
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/categories/[id]">) {
  try {
    const { id } = await ctx.params;

    await prisma.category.delete({
      where: { id },
    });

    return ok(null, "Category deleted successfully");
  } catch (error) {
    return handleApiError(error, "Category");
  }
}
