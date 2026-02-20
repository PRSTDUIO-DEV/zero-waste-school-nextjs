import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/waste", "/statistics", "/leaderboard"];

// Routes that require ADMIN role
const adminRoutes = ["/admin"];

// Routes that should redirect authenticated users away (e.g., login/signup pages)
const authRoutes = ["/auth/signin", "/auth/signup"];

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Skip middleware for API routes, static files, and special Next.js routes
    if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuthenticated = !!token;

    // Redirect authenticated users away from auth pages
    if (
      isAuthenticated &&
      authRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Protect authenticated routes
    if (
      !isAuthenticated &&
      protectedRoutes.some((route) => pathname.startsWith(route))
    ) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Protect admin routes - require ADMIN role
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        const signInUrl = new URL("/auth/signin", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
      }

      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Handle errors gracefully during build time or edge cases
    console.warn("Middleware error for:", request.url);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes - handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
