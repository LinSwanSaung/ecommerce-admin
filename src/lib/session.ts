import { createHmac } from "node:crypto";

// token = base64url("email|expiresAt") + "." + HMAC signature.
// server-only, never import from client code

const SECRET = process.env.SESSION_SECRET ?? "dev-only-secret";
export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const sign = (payload: string) =>
  createHmac("sha256", SECRET).update(payload).digest("base64url");

export function createSessionToken(email: string): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(`${email}|${expiresAt}`).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  if (sign(payload) !== signature) return null; // tampered or wrong secret

  const [email, expiresAt] = Buffer.from(payload, "base64url")
    .toString()
    .split("|");
  if (!email || Number(expiresAt) < Date.now()) return null; // expired

  return email;
}
