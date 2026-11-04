import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email" }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Enter your password" }).max(200),
});

// Slows down password guessing: max 8 wrong tries per email + IP in 15 minutes
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 8;
const fails = new Map<string, { count: number; first: number }>();

function tooManyTries(key: string) {
  const entry = fails.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    fails.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILS;
}

function recordFail(key: string) {
  const entry = fails.get(key);
  if (!entry || Date.now() - entry.first > WINDOW_MS)
    fails.set(key, { count: 1, first: Date.now() });
  else entry.count += 1;
}

// POST /api/auth/login — Body: { email, password }. Sets the admin session cookie.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Check your email and password", 400, z.flattenError(parsed.error).fieldErrors);
  }
  const { email, password } = parsed.data;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${ip}:${email}`;
  if (tooManyTries(key)) {
    return fail("Too many wrong attempts. Please wait 15 minutes and try again.", 429);
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    // Same message for "no such email" and "wrong password", so emails can't be guessed
    const valid = admin ? await bcrypt.compare(password, admin.password) : false;
    if (!admin || !valid) {
      recordFail(key);
      return fail("Invalid email or password.", 401);
    }

    fails.delete(key);
    const token = await createSessionToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
    });
    (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
    return ok({ name: admin.name, email: admin.email }, "Logged in");
  } catch (error) {
    return handleApiError(error, "Admin");
  }
}
