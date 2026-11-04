import { prisma } from "@/lib/prisma";
import { handleApiError, ok } from "@/lib/api-response";
import { getUser } from "@/lib/user-auth";

// GET /api/users/me — the logged-in reader (with counts), or null when logged out.
export async function GET() {
  // Outside try/catch on purpose: reading the login cookie makes this route run per request
  const session = await getUser();
  try {
    if (!session) return ok(null, "Not logged in");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { likes: true, saves: true, comments: true } },
      },
    });
    return ok(user);
  } catch (error) {
    return handleApiError(error, "Account");
  }
}
