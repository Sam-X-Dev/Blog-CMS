import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/api-response";
import { readUserToken, USER_COOKIE, type UserSession } from "@/lib/session";

/**
 * The logged-in reader, or null. Checks the signed cookie AND that the account still exists.
 * cache(): one database check per request.
 */
export const getUser = cache(async (): Promise<UserSession | null> => {
  const session = await readUserToken((await cookies()).get(USER_COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });
  return user ? { userId: user.id, email: user.email, name: user.name } : null;
});

/**
 * For reader API routes:
 *   const { user, denied } = await requireUserApi();
 *   if (denied) return denied;
 */
export async function requireUserApi() {
  const user = await getUser();
  return user
    ? ({ user, denied: null } as const)
    : ({ user: null, denied: fail("Please log in first", 401) } as const);
}
