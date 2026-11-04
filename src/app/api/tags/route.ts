import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { slugify } from "@/lib/slugify";
import { tagSchema } from "@/lib/validations/blog";
import { requireAdminApi } from "@/lib/auth";

// GET /api/tags — all tags with how many blogs use each (A to Z)
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { blogs: true } } },
    });
    return ok(tags, "Tags fetched successfully");
  } catch (error) {
    return handleApiError(error, "Tag");
  }
}

// POST /api/tags. Body: { name }
export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const parsed = tagSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Invalid tag", 400, z.flattenError(parsed.error).fieldErrors);

  const slug = slugify(parsed.data.name);
  if (!slug)
    return fail("Use letters or numbers in the name", 400, { name: ["Use letters or numbers"] });
  try {
    const tag = await prisma.tag.create({ data: { name: parsed.data.name, slug } });
    return ok(tag, "Tag created", 201);
  } catch (error) {
    return handleApiError(error, "Tag");
  }
}
