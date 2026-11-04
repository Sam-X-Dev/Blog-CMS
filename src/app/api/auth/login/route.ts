import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { clientIp, createLimiter } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/user";

// Slows down password guessing: max 8 wrong tries per email + IP in 15 minutes
const wrongTries = createLimiter(8, 15 * 60 * 1000);

// POST /api/auth/login — Body: { email, password }. Sets the admin session cookie.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Check your email and password", 400, z.flattenError(parsed.error).fieldErrors);
  }
  const { email, password } = parsed.data;

  const key = `${clientIp(request)}:${email}`;
  if (wrongTries.limited(key)) {
    return fail("Too many wrong attempts. Please wait 15 minutes and try again.", 429);
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    // Same message for "no such email" and "wrong password", so emails can't be guessed
    const valid = admin ? await bcrypt.compare(password, admin.password) : false;
    if (!admin || !valid) {
      wrongTries.hit(key);
      return fail("Invalid email or password.", 401);
    }

    wrongTries.reset(key);
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
