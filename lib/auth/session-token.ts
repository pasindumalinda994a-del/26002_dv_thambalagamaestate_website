import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "admin_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

type SessionPayload = {
  role: "admin";
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyAdminSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
