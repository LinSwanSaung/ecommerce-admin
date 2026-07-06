import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySessionToken } from "./session";

// Mock user store — one hardcoded staff account, matching the app's mock
// backend. A real app would check a database and hash passwords.
export const DEMO_USER = {
  email: "admin@acme.com",
  password: "admin123",
  name: "Alex Admin",
};

export type SessionUser = { email: string; name: string };

// Server-side session lookup (server components / route handlers only).
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const email = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (email !== DEMO_USER.email) return null;
  return { email: DEMO_USER.email, name: DEMO_USER.name };
}
