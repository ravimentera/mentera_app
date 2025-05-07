import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For dashboard routes, check if user came from login (in a real app, we would check auth tokens)
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings")
  ) {
    // In a real app, check for authentication token
    // For this demo, we'll mock "auth" by checking a session cookie
    const hasAuth = request.cookies.has("auth_session");

    if (!hasAuth) {
      // Create a URL object to safely append a 'redirect' parameter
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match the root path and dashboard paths
    "/",
    "/dashboard/:path*",
    "/appointments/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
