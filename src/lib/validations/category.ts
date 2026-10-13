import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string({ error: "Category name is required" })
    .trim()
    .min(2, { error: "Category name must be at least 2 characters" })
    .max(50, { error: "Category name must be at most 50 characters" }),
});

export type CategoryInput = z.infer<typeof categorySchema>;
