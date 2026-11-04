// Login sessions: a signed token (JWT) in an httpOnly cookie.
// Two kinds that can never be swapped: "admin" (admin panel) and "user" (readers on the website).
// No "server-only" import here because proxy.ts uses it too; it never runs in the browser.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "blogcms_admin";
export const USER_COOKIE = "blogcms_user";
export const SESSION_DAYS = 7;
export const USER_SESSION_DAYS = 30;

export type AdminSession = { adminId: string; email: string; name: string };
export type UserSession = { userId: string; email: string; name: string };

type Kind = "admin" | "user";
type Identity = { id: string; email: string; name: string };

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET is missing in .env (it must be at least 32 characters).");
  }
  return new TextEncoder().encode(secret);
}

function signToken(kind: Kind, who: Identity, days: number) {
  return new SignJWT({ email: who.email, name: who.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(who.id)
    .setAudience(kind) // a reader's token is rejected by the admin panel and the other way round
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(secretKey());
}

async function verifyToken(kind: Kind, token: string | undefined): Promise<Identity | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      audience: kind,
    });
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null; // missing, expired, tampered with or the wrong kind
  }
}

/** Signed token for a logged-in admin, valid for SESSION_DAYS days. */
export function createSessionToken(session: AdminSession) {
  return signToken("admin", { id: session.adminId, ...session }, SESSION_DAYS);
}

/** The admin in this token, or null. */
export async function readSessionToken(token: string | undefined): Promise<AdminSession | null> {
  const who = await verifyToken("admin", token);
  return who ? { adminId: who.id, email: who.email, name: who.name } : null;
}

/** Signed token for a logged-in reader, valid for USER_SESSION_DAYS days. */
export function createUserToken(session: UserSession) {
  return signToken("user", { id: session.userId, ...session }, USER_SESSION_DAYS);
}

/** The reader in this token, or null. */
export async function readUserToken(token: string | undefined): Promise<UserSession | null> {
  const who = await verifyToken("user", token);
  return who ? { userId: who.id, email: who.email, name: who.name } : null;
}

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const sessionCookieOptions = { ...baseCookie, maxAge: SESSION_DAYS * 24 * 60 * 60 };
export const userCookieOptions = { ...baseCookie, maxAge: USER_SESSION_DAYS * 24 * 60 * 60 };
