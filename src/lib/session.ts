// Admin login session: a signed token (JWT) in an httpOnly cookie.
// No "server-only" import here because proxy.ts uses it too; it never runs in the browser.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "blogcms_admin";
export const SESSION_DAYS = 7;

export type AdminSession = { adminId: string; email: string; name: string };

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET is missing in .env (it must be at least 32 characters).");
  }
  return new TextEncoder().encode(secret);
}

/** Signed token for a logged-in admin, valid for SESSION_DAYS days. */
export async function createSessionToken(session: AdminSession) {
  return new SignJWT({ email: session.email, name: session.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

/** The admin in this token, or null if it is missing, expired, tampered with or unreadable. */
export async function readSessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return {
      adminId: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};
