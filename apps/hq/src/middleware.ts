import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware for HQ.
 *
 * InstantDB uses client-side auth, so the middleware does a lightweight check
 * for the presence of the InstantDB auth token cookie. The full auth state is
 * validated on the client via db.useAuth().
 *
 * Protected routes: /dashboard/*
 * Public routes: /login, /api/*
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon");

  if (isPublic) {
    return NextResponse.next();
  }

  // Check for InstantDB auth token
  const token =
    request.cookies.get("__session")?.value ||
    request.cookies.get("instant_token")?.value;

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
