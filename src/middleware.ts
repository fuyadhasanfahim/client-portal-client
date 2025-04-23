import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const isAuthenticated = !!req.nextauth.token;

        const isAuthPage =
            pathname.startsWith('/sign-in') ||
            pathname.startsWith('/sign-up') ||
            pathname.startsWith('/forgot-password') ||
            pathname.startsWith('/reset-password');

        if (isAuthenticated && isAuthPage) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        if (!isAuthenticated && isAuthPage) {
            return NextResponse.next();
        }

        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: () => true,
        },
    }
);

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
