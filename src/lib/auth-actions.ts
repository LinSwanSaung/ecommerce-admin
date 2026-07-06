"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { DEMO_USER } from "./auth";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "./session";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Server Action: runs on the server, called directly from the login form.
// Credentials never touch client-side auth logic; the session cookie is
// httpOnly so client JS can't read or steal it.
export async function login(values: unknown): Promise<{ error: string } | void> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid email or password" };

  const { email, password } = parsed.data;
  if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
    return { error: "Invalid email or password" };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(email), {
    httpOnly: true, // not readable from client JS (XSS protection)
    sameSite: "lax", // not sent on cross-site POSTs (CSRF mitigation)
    secure: process.env.NODE_ENV === "production", // HTTPS-only in prod
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect("/dashboard");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
