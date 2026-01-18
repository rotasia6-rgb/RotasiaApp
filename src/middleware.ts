import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get("auth_session");
    const { pathname } = request.nextUrl;

    // If user has valid cookie and tries to access login, redirect to dashboard
    if (authCookie && pathname === "/login") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // If user is missing cookie and tries to access protected routes
    // Protected routes: Root (/) and Scan (/scan)
    // We allow public assets like /_next, /static, /favicon.ico etc.
    const isProtectedRoute = pathname === "/" || pathname.startsWith("/scan");

    if (!authCookie && isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
