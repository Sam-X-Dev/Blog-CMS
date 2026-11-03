import "server-only";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { sanitizeBlogHtml } from "@/lib/sanitize";
import type { BlogInput } from "@/lib/validations/blog";

/** Thrown when the admin's input can't be saved; the API turns it into a 4xx with field errors. */
export class BlogInputError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
  }
}

/** A slug nobody else uses: "my-blog", then "my-blog-2", "my-blog-3"... */
export async function uniqueSlug(base: string, exceptId?: string) {
  const root = (slugify(base) || "blog").slice(0, 110);
  for (let n = 1; n < 200; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const taken = await prisma.blog.findFirst({
      where: { slug: candidate, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${root}-${Date.now()}`;
}

/** Turns validated form input into database fields (shared by create and update). */
export async function toBlogData(input: BlogInput) {
  if (input.categoryId) {
    const exists = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!exists) {
      throw new BlogInputError("That category no longer exists", 400, {
        categoryId: ["Pick another category"],
      });
    }
  }

  // Same tag typed twice ("React", "react") counts once
  const tags = new Map<string, string>();
  for (const name of input.tags) {
    const slug = slugify(name);
    if (slug && !tags.has(slug)) tags.set(slug, name);
  }

  return {
    title: input.title,
    description: input.description,
    content: sanitizeBlogHtml(input.content),
    thumbnail: input.thumbnail,
    categoryId: input.categoryId,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    status: input.status,
    tagsConnect: [...tags].map(([slug, name]) => ({ where: { slug }, create: { slug, name } })),
  };
}

/** What's missing before this blog can go live (empty list = ready to publish). */
export function publishProblems(blog: {
  description: string;
  content: string;
  thumbnail: string | null;
}) {
  const problems: string[] = [];
  if (blog.description.trim().length < 10) problems.push("a description");
  const text = blog.content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  if (!text && !/<img\b/i.test(blog.content)) problems.push("some content");
  if (!blog.thumbnail) problems.push("a thumbnail");
  return problems;
}
