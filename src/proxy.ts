import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";

/**
 * First line of defence for the admin panel (Next.js 16 "proxy", formerly middleware):
 * - /admin pages need a valid admin session, otherwise → /admin/login
 * - admin APIs need it too, otherwise → 401
 * Every admin page and API also checks the session itself (see lib/auth.ts), so nothing
 * relies on this file alone.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  // Tell the admin layout which page this is (overwrites anything the browser sent)
  const headers = new Headers(request.headers);
  headers.set("x-admin-path", pathname);
  const next = () => NextResponse.next({ request: { headers } });

  if (pathname === "/admin/login") {
    // Already logged in: skip the login form
    return session ? NextResponse.redirect(new URL("/admin", request.url)) : next();
  }

  if (pathname.startsWith("/api/")) {
    if (!isAdminApi(request.method, pathname) || session) return next();
    return NextResponse.json(
      { success: false, message: "Please log in as admin" },
      { status: 401 }
    );
  }

  if (session) return next();
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

/** Public APIs stay open: published blogs, view counting, and reading categories/tags. */
function isAdminApi(method: string, pathname: string) {
  if (pathname.startsWith("/api/blogs/public")) return false;
  const publicRead =
    method === "GET" &&
    (pathname.startsWith("/api/categories") || pathname.startsWith("/api/tags"));
  return !publicRead;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/blogs/:path*",
    "/api/categories/:path*",
    "/api/tags/:path*",
    "/api/media/:path*",
    "/api/upload",
    "/api/markdown",
    "/api/featured/:path*",
    "/api/trending/:path*",
  ],
};
