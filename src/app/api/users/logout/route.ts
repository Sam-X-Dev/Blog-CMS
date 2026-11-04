import { cookies } from "next/headers";
import { ok } from "@/lib/api-response";
import { USER_COOKIE } from "@/lib/session";

// POST /api/users/logout — removes the reader session cookie.
export async function POST() {
  (await cookies()).delete(USER_COOKIE);
  return ok(null, "Logged out");
}
