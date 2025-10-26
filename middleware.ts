import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Define paths that should always be excluded from the maintenance check.
    const excludedPaths = [
        '/api/', // Exclude all API routes
        '/_next/static/', // Exclude static files
        '/_next/image',
        '/favicon.ico',
        '/maintenance', // Don't redirect the maintenance page itself
        '/boss/login', // Allow access to the admin login page
    ];

    // If the path is in the exclusion list, do nothing.
    if (excludedPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    try {
        // 2. Fetch the maintenance status from our dedicated API endpoint.
        // We use the absolute URL because middleware runs in a different context.
        const maintenanceUrl = new URL('/api/maintenance-check', request.url);
        const maintenanceRes = await fetch(maintenanceUrl);

        if (!maintenanceRes.ok) {
           console.error("Maintenance check API failed, defaulting to off.");
           return NextResponse.next();
        }

        const { isEnabled } = await maintenanceRes.json();

        // If maintenance mode is not enabled, proceed as normal.
        if (!isEnabled) {
            return NextResponse.next();
        }

        // 3. If maintenance mode is ON, check if the user is an admin.
        let isAdmin = false;
        const token = request.cookies.get('firebaseIdToken')?.value;

        if (token) {
            try {
                // To verify the token without Firebase Admin SDK, we can check its claims.
                // This is less secure than full verification but sufficient for this purpose.
                // A more secure way would involve another API call to a verification endpoint.
                const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                if (decodedToken.role === 'admin') {
                    isAdmin = true;
                }
            } catch (e) {
                console.error("Cookie token decoding failed:", e);
            }
        }

        // 4. If maintenance is ON and user is NOT an admin, redirect to maintenance page.
        if (!isAdmin) {
             const url = request.nextUrl.clone()
             url.pathname = '/maintenance'
            return NextResponse.rewrite(url);
        }

        // 5. If user is an admin, allow them to proceed.
        return NextResponse.next();

    } catch (error) {
        console.error("Error in middleware:", error);
        // Fail-safe: If anything goes wrong, default to not showing the maintenance page.
        return NextResponse.next();
    }
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
