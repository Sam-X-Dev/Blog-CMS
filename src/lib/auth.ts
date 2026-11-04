import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/api-response";
import { readSessionToken, SESSION_COOKIE, type AdminSession } from "@/lib/session";

/**
 * The logged-in admin, or null. Checks the signed cookie AND that the admin still exists
 * (a deleted admin is logged out right away). cache(): one database check per request.
 */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await readSessionToken(token);
  if (!session) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, email: true, name: true },
  });
  return admin ? { adminId: admin.id, email: admin.email, name: admin.name } : null;
});

/** For admin pages and admin data: sends visitors who aren't logged in to the login page. */
export async function requireAdminPage(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/**
 * For admin API routes. Returns a 401 response to send back, or null when the admin is logged in:
 *   const denied = await requireAdminApi();
 *   if (denied) return denied;
 */
export async function requireAdminApi() {
  return (await getAdmin()) ? null : fail("Please log in as admin", 401);
}
