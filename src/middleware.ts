import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

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
    return;
  }

  // Only check auth for protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isAuthRoute) {
    return await updateSession(request);
  }

  return;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};