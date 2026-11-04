import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { createUserToken, USER_COOKIE, userCookieOptions } from "@/lib/session";
import { clientIp, createLimiter } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/user";

// Max 8 wrong tries per email + IP in 15 minutes
const wrongTries = createLimiter(8, 15 * 60 * 1000);

// POST /api/users/login — Body: { email, password }. Sets the reader session cookie.
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      wrongTries.hit(key);
      return fail("No account found with this email. Please sign up first.", 404, {
        email: ["This email is not registered"],
      });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      wrongTries.hit(key);
      return fail("Incorrect password. Please try again.", 401, {
        password: ["Incorrect password"],
      });
    }

    wrongTries.reset(key);
    const token = await createUserToken({ userId: user.id, email: user.email, name: user.name });
    (await cookies()).set(USER_COOKIE, token, userCookieOptions);
    return ok({ name: user.name, email: user.email }, "Logged in");
  } catch (error) {
    return handleApiError(error, "Account");
  }
}
