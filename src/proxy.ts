import { NextResponse, type NextRequest } from "next/server";

import { DEMO_USER } from "@/lib/auth";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Next 16 renamed middleware to proxy. Redirects based on session state.
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  // same definition of "signed in" as getSessionUser: valid token AND a known
  // user. If this layer said yes while the layout said no, a stale cookie
  // would bounce between /login and /dashboard forever.
  const isAuthed = verifySessionToken(token) === DEMO_USER.email;
  const { pathname } = request.nextUrl;

  if (!isAuthed && pathname !== "/login") {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (token) response.cookies.delete(SESSION_COOKIE); // clear the bad cookie
    return response;
  }
  if (isAuthed && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next's static assets and the favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
