import { timingSafeEqual } from "crypto";

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("Missing ADMIN_PASSWORD environment variable");
  }

  const a = Buffer.from(password);
  const b = Buffer.from(expected);

  if (a.length !== b.length) {
    // Still run a compare to reduce timing variance on length mismatch.
    timingSafeEqual(a, a);
    return false;
  }

  return timingSafeEqual(a, b);
}
