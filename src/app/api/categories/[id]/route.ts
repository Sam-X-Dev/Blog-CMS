import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { slugify } from "@/lib/slugify";
import { categorySchema } from "@/lib/validations/category";

type Ctx = RouteContext<"/api/categories/[id]">;

// GET /api/categories/:id
export async function GET(_request: Request, ctx: Ctx) {
    const { id } = await ctx.params;
    try {
        const category = await prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { blogs: true } } },
        });
        if (!category) return fail("Category not found", 404);
        return ok(category, "Category fetched successfully");
    } catch (error) {
        return handleApiError(error, "Category");
    }
}

// PUT /api/categories/:id — admin only. Body: { name: string }
export async function PUT(request: Request, ctx: Ctx) {
    const { id } = await ctx.params;

    const body = await request.json().catch(() => null);
    if (!body) return fail("Request body must be valid JSON", 400);

    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
        return fail("Invalid category data", 400, z.flattenError(parsed.error).fieldErrors);
    }

    try {
        const { name } = parsed.data;
        const category = await prisma.category.update({
            where: { id },
            data: { name, slug: slugify(name) },
        });
        return ok(category, "Category updated successfully");
    } catch (error) {
        return handleApiError(error, "Category");
    }
}

// DELETE /api/categories/:id — admin only.
// Blogs in this category are kept; their category becomes empty (onDelete: SetNull).
export async function DELETE(_request: Request, ctx: Ctx) {
    const { id } = await ctx.params;
    try {
        await prisma.category.delete({ where: { id } });
        return ok({ id }, "Category deleted successfully");
    } catch (error) {
        return handleApiError(error, "Category");
    }
}