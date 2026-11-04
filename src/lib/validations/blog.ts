import { z } from "zod";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Visible words in editor HTML (tags removed). Used to check a blog isn't empty. */
export function plainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, { error: `${label} must be ${max} characters or less` })
    .nullish()
    .transform((v) => (v ? v : null));

/**
 * What the admin blog form sends (create and update).
 * Drafts can be incomplete; publishing needs a description, content and a thumbnail.
 */
export const blogInputSchema = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(5, { error: "Title must be at least 5 characters" })
      .max(150, { error: "Title must be 150 characters or less" }),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .max(120, { error: "URL must be 120 characters or less" })
      .refine((v) => v === "" || SLUG_PATTERN.test(v), {
        error: "Use only lowercase letters, numbers and single hyphens (e.g. my-first-blog)",
      })
      .default(""),
    description: z
      .string()
      .trim()
      .min(1, { error: "Description is required" })
      .max(300, { error: "Description must be 300 characters or less" }),
    content: z.string().max(1_000_000, { error: "Content is too long" }).default(""),
    thumbnail: z
      .string()
      .trim()
      .max(1000)
      .refine((v) => v === "" || /^(https:\/\/|\/)/.test(v), {
        error: "Thumbnail must be an image link",
      })
      .nullish()
      .transform((v) => (v ? v : null)),
    categoryId: z
      .string()
      .trim()
      .max(50)
      .nullish()
      .transform((v) => (v ? v : null)),
    tags: z
      .array(z.string().trim().min(1).max(40, { error: "A tag must be 40 characters or less" }))
      .max(10, { error: "Use 10 tags or fewer" })
      .default([]),
    seoTitle: optionalText(70, "SEO title"),
    seoDescription: optionalText(160, "SEO description"),
    status: z.enum(["DRAFT", "PUBLISHED"], { error: "Status must be DRAFT or PUBLISHED" }),
  })
  .superRefine((blog, ctx) => {
    if (blog.status !== "PUBLISHED") return;
    if (blog.description.length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["description"],
        message: "Add a description (at least 10 characters) before publishing",
      });
    }
    if (!plainText(blog.content) && !/<img\b/i.test(blog.content)) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Write some content before publishing",
      });
    }
    if (!blog.thumbnail) {
      ctx.addIssue({
        code: "custom",
        path: ["thumbnail"],
        message: "Add a thumbnail before publishing",
      });
    }
  });

export type BlogInput = z.infer<typeof blogInputSchema>;

export const blogStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"], { error: "Status must be DRAFT or PUBLISHED" }),
});

export const tagSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, { error: "Name is required" })
    .max(40, { error: "Name must be 40 characters or less" }),
});
