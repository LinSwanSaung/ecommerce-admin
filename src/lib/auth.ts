import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySessionToken } from "./session";

// hardcoded demo user, a real app would hit a DB and hash passwords
export const DEMO_USER = {
  email: "lin@swansupply.com",
  password: "admin123",
  name: "Lin Swan Saung",
};

export type SessionUser = { email: string; name: string };

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const email = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (email !== DEMO_USER.email) return null;
  return { email: DEMO_USER.email, name: DEMO_USER.name };
}
