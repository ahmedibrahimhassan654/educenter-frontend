import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Protected routes that require authentication
const protectedRoutes = ["/dashboard", "/admin", "/teacher", "/student", "/parent"];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes and static files
  const isPublicRoute = pathname === "/" || 
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Only check auth for protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Check for token in cookie or Authorization header
  const token = request.cookies.get("educenter_token")?.value || 
                request.headers.get("Authorization")?.replace("Bearer ", "");

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};