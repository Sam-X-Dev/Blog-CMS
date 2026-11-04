/** Only go back to pages on this website after login (never to another site or the admin). */
export function safeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/admin")) {
    return "/";
  }
  return next;
}
