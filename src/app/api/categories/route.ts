import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { slugify } from "@/lib/slugify";
import { categorySchema } from "@/lib/validations/category";

// GET
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { blogs: true } } },
        });
        // sorting
        categories.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
        return ok(categories, "Categories fetched successfully");
    } catch (error) {
        return handleApiError(error, "Category");
    }
}

// POST 
export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    if (!body) return fail("Request body must be valid JSON", 400);

    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
        return fail("Invalid category data", 400, z.flattenError(parsed.error).fieldErrors);
    }

    try {
        const { name } = parsed.data;
        const category = await prisma.category.create({
            data: { name, slug: slugify(name) },
        });
        return ok(category, "Category created successfully", 201);
    } catch (error) {
        return handleApiError(error, "Category");
    }
}