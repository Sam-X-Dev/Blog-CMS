/**
 * A real-looking email address:
 * - name part: letters, numbers and . _ % + -  (no dot at the start or end, no ".." )
 * - then @ and a domain like gmail.com or pwioi.co.in (each part letters/numbers/hyphens)
 * - ending in a 2+ letter extension (.com, .in, .org ...)
 * Shared by the sign up / log in forms and the API, so both check the same way.
 */
export const EMAIL_PATTERN =
  /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]{1,64}(?<!\.)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

export const EMAIL_MESSAGE = "Enter a valid email address, like name@example.com";

export function isValidEmail(value: string) {
  return value.length <= 254 && EMAIL_PATTERN.test(value.trim());
}
