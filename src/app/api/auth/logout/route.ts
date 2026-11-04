import { cookies } from "next/headers";
import { ok } from "@/lib/api-response";
import { SESSION_COOKIE } from "@/lib/session";

// POST /api/auth/logout — removes the admin session cookie.
export async function POST() {
  (await cookies()).delete(SESSION_COOKIE);
  return ok(null, "Logged out");
}
