import { ok, handleApiError } from "@/lib/api-response";
import { toPageNumber, toSearchText, toSlug, toSort } from "@/lib/blog-utils";
import { searchBlogs } from "@/lib/queries/public-blogs";

// GET /api/blogs/public?search=&category=&tag=&page=&sort=   (public, no login)
// search: words to find in title, description, tags or category name ("q" works too)
// category, tag: slugs · page: 1, 2, 3... (9 per page) · sort: newest | oldest | popular
// Only PUBLISHED blogs are returned.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const page = toPageNumber(params.get("page") ?? undefined);

  try {
    const { blogs, total, totalPages } = await searchBlogs({
      q: toSearchText(params.get("search") ?? params.get("q") ?? undefined),
      categorySlug: toSlug(params.get("category") ?? undefined),
      tagSlug: toSlug(params.get("tag") ?? undefined),
      sort: toSort(params.get("sort") ?? undefined),
      page,
    });
    return ok({ items: blogs, total, page, totalPages }, "Blogs fetched successfully");
  } catch (error) {
    return handleApiError(error, "Blog");
  }
}
