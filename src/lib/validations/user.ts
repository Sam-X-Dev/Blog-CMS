import { z } from "zod";

const email = z.email({ error: "Enter a valid email" }).trim().toLowerCase().max(200);

/** Reader sign up */
export const registerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, { error: "Name must be at least 2 characters" })
    .max(50, { error: "Name must be 50 characters or less" }),
  email,
  password: z
    .string({ error: "Password is required" })
    .min(8, { error: "Password must be at least 8 characters" })
    .max(100, { error: "Password must be 100 characters or less" }),
});

/** Reader and admin login */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password" }).max(200),
});

/** A comment on a blog. Plain text only (shown as text, never as HTML). */
export const commentSchema = z.object({
  blogId: z.string().trim().min(1, { error: "Blog is missing" }).max(50),
  content: z
    .string({ error: "Write a comment" })
    .trim()
    .min(2, { error: "Comment is too short" })
    .max(1000, { error: "Comment must be 1000 characters or less" }),
});
