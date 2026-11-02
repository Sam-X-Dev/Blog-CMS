import { z } from "zod";

/** What the browser sends after Cloudinary accepted an upload */
export const saveMediaSchema = z.object({
  publicId: z.string().trim().min(1).max(255),
  version: z.number().int().positive(),
  signature: z.string().trim().min(10).max(128),
  format: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]{2,5}$/, { error: "Unknown image format" }),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
  bytes: z.number().int().positive().optional(),
});

export type SaveMediaInput = z.infer<typeof saveMediaSchema>;
