import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Next 16 renamed middleware to proxy. Redirects based on session state.
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthed = verifySessionToken(token) !== null;
  const { pathname } = request.nextUrl;

  if (!isAuthed && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
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
