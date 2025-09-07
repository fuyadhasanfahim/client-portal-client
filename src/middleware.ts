import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import getAccessibleRoutes from './utils/getAccessibleRoutes';
import { TeamPermissions } from './next-auth';

export default withAuth(
    async function middleware(req) {
        const { pathname } = req.nextUrl;
        const isAuthenticated = !!req.nextauth.token;
        const user = (req.nextauth.token as any) || {};

        const isAuthPage =
            pathname.startsWith('/sign-in') ||
            pathname.startsWith('/sign-up') ||
            pathname.startsWith('/forgot-password') ||
            pathname.startsWith('/reset-password') ||
            pathname.startsWith('/invitation-form') ||
            pathname.startsWith('/invite-team-member') ||
            pathname.startsWith('/api/auth');

        if ((isAuthenticated && isAuthPage) || pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        if (!isAuthenticated && isAuthPage) {
            return NextResponse.next();
        }

        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        const hasAccess = await getAccessibleRoutes({
            pathname,
            role: user?.role as string,
        });

        if (hasAccess === false) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
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
