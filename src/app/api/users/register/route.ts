import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { createUserToken, USER_COOKIE, userCookieOptions } from "@/lib/session";
import { clientIp, createLimiter } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations/user";

// Max 5 new accounts per IP per hour (stops sign-up spam)
const signups = createLimiter(5, 60 * 60 * 1000);

// POST /api/users/register — Body: { name, email, password }. Creates a reader account and logs in.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields", 400, z.flattenError(parsed.error).fieldErrors);
  }
  const { name, email, password } = parsed.data;

  const ip = clientIp(request);
  if (signups.limited(ip)) {
    return fail("Too many accounts created. Please try again later.", 429);
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) {
      return fail("An account with this email already exists. Log in instead.", 409, {
        email: ["An account with this email already exists"],
      });
    }

    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 12) },
      select: { id: true, name: true, email: true },
    });
    signups.hit(ip);

    const token = await createUserToken({ userId: user.id, email: user.email, name: user.name });
    (await cookies()).set(USER_COOKIE, token, userCookieOptions);
    return ok({ name: user.name, email: user.email }, "Account created", 201);
  } catch (error) {
    return handleApiError(error, "Account");
  }
}
