// GET is public (used by filters and the blog form). POST/PUT/DELETE become admin-only once Samarth adds proxy.ts (Next 16's replacement for middleware.ts).

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleApiError } from "@/lib/api-response";
import { categorySchema } from "@/lib/validations/category";
import { slugify } from "@/lib/slugify";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { blogs: true },
        },
      },
    });

    return ok(categories, "Categories fetched successfully");
  } catch (error) {
    return handleApiError(error, "Category");
  }
}

export async function POST(request: Request) {
  try {
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

    const category = await prisma.category.create({
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

    return ok(category, "Category created successfully", 201);
  } catch (error) {
    return handleApiError(error, "Category");
  }
}
