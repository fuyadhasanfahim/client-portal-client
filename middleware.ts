import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth?.token;

        // Redirect logged-in users away from auth pages
        if (token && (pathname === '/sign-in' || pathname === '/sign-up')) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                return !!token; // Let middleware decide redirect logic
            },
        },
    }
);

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
