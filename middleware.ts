import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For dashboard routes, check auth token
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings")
  ) {
    // Check for auth session cookie (primary) or JWT auth_token (secondary) or Authorization header
    const authSession = request.cookies.get("auth_session")?.value;
    const authToken =
      request.cookies.get("auth_token")?.value || request.headers.get("authorization");

    if (!authSession && !authToken) {
      // Create a URL object to safely append a 'redirect' parameter
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Add CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;
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
    // Match API routes
    "/api/:path*",
  ],
};
