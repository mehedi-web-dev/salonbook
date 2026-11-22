import { NextResponse, type NextRequest } from "next/server";

/**
 * Server-Side Authentication & Role-Based Authorization Middleware for SalonBook.
 * 
 * Enforces strict access control for all /dashboard routes:
 * 1. Unauthenticated visitors are redirected immediately to /login before any page content renders.
 * 2. Active session cookies are validated against Better Auth session endpoints.
 * 3. Role-based authorization:
 *    - Customers attempting to access /dashboard/admin/* are redirected to /dashboard.
 *    - Administrators visiting root /dashboard are redirected to /dashboard/admin.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply protection to dashboard paths
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // 1. Fast path: Check for Better Auth session token cookie
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken || !sessionToken.trim()) {
    // Unauthenticated: Redirect to login immediately on server
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Server-side session verification via Better Auth endpoint
  try {
    const sessionEndpoint = new URL("/api/auth/get-session", request.url);
    const sessionRes = await fetch(sessionEndpoint.toString(), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!sessionRes.ok) {
      // Invalid or expired session: Redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const sessionData = await sessionRes.json().catch(() => null);
    const user = sessionData?.user;

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based authorization
    const isAdmin = user.role === "admin";
    const isAdminRoute = pathname.startsWith("/dashboard/admin");

    // Non-admin attempting to access /dashboard/admin/*
    if (isAdminRoute && !isAdmin) {
      const customerDashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(customerDashboardUrl);
    }

    // Admin visiting root /dashboard -> direct to Admin Overview
    if (pathname === "/dashboard" && isAdmin) {
      const adminDashboardUrl = new URL("/dashboard/admin", request.url);
      return NextResponse.redirect(adminDashboardUrl);
    }
  } catch (error) {
    // In case of transient network failure reaching backend during SSR,
    // fallback to letting client-side CustomerGuard / AdminGuard perform defense-in-depth check
    console.warn("[Middleware] Transient error during session verification:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
