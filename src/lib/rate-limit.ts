import "server-only";

/**
 * Small in-memory limiter: at most `max` hits per key inside `windowMs`.
 * Used to slow down password guessing, sign-up spam and comment spam.
 * (Per server instance; good enough for this project, no Redis needed.)
 */
export function createLimiter(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; first: number }>();

  function fresh(key: string) {
    const entry = hits.get(key);
    if (entry && Date.now() - entry.first > windowMs) {
      hits.delete(key);
      return undefined;
    }
    return entry;
  }

  return {
    /** true when this key has used up its tries */
    limited(key: string) {
      return (fresh(key)?.count ?? 0) >= max;
    },
    hit(key: string) {
      const entry = fresh(key);
      if (entry) entry.count += 1;
      else hits.set(key, { count: 1, first: Date.now() });
    },
    reset(key: string) {
      hits.delete(key);
    },
  };
}

/** The visitor's IP address (first one when behind a proxy like Vercel). */
export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
