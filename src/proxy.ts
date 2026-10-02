import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Deny-by-default auth gate: every route except /login (and static assets,
// excluded via the matcher) requires a valid session cookie.
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login") return NextResponse.next();

  if (!process.env.SESSION_SECRET || !process.env.APP_PASSWORD) {
    // Auth is not configured. Never expose data in production; allow local
    // development so the app can be built before secrets exist.
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token && (await verifySessionToken(token))) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|manifest\\.webmanifest|.*\\.svg).*)",
  ],
};
