import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const response = await fetch(new URL('/api/maintenance-check', request.url));
    const { maintenanceMode } = await response.json();
    const { pathname } = request.nextUrl;

    // If in maintenance mode, redirect all paths to /maintenance, except for the maintenance page itself
    if (maintenanceMode && pathname !== '/maintenance') {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    // If not in maintenance mode, and user is on the maintenance page, redirect to home
    if (!maintenanceMode && pathname === '/maintenance') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error("Error in middleware:", error);
    // If the maintenance check fails, we'll let the user through
  }


  return NextResponse.next();
}

// See "Matching Paths" below to learn more
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
}
