import { connection } from "next/server";
import { ok, handleApiError } from "@/lib/api-response";
import { getHomeBlogs } from "@/lib/queries/public-blogs";

// GET /api/blogs/public/featured   (public, no login)
// { featured, latest }: the homepage's featured blog (admin pick, else the newest)
// and the 6 newest blogs after it. featured is null when nothing is published yet.
export async function GET() {
  await connection(); // always fresh, never frozen at build time
  try {
    const data = await getHomeBlogs(6);
    return ok(data, "Featured and latest blogs fetched successfully");
  } catch (error) {
    return handleApiError(error, "Blog");
  }
}
