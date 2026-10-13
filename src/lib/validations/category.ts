import { z } from "zod";

export const categorySchema = z.object({
    name: z
        .string({ error: "Name is required" })
        .trim()
        .min(2, { error: "Name must be at least 2 characters" })
        .max(50, { error: "Name must be 50 characters or less" }),
});

export type CategoryInput = z.infer<typeof categorySchema>;