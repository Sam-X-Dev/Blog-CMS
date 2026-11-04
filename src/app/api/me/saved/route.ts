import { handleApiError, ok } from "@/lib/api-response";
import { getSavedBlogs } from "@/lib/queries/public-blogs";
import { requireUserApi } from "@/lib/user-auth";

// GET /api/me/saved — the logged-in reader's saved blogs.
export async function GET() {
  const { user, denied } = await requireUserApi();
  if (denied) return denied;
  try {
    return ok(await getSavedBlogs(user.userId));
  } catch (error) {
    return handleApiError(error, "Saved blogs");
  }
}
