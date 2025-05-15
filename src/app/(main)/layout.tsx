import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import NextAuthProvider from '../NextAuthProvider';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { SiteHeader } from '@/components/shared/site-header';
import { getUserData } from '@/actions/user.action';
import VerificationAlert from '@/components/shared/VerificationAlert';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Client Portal',
    description: 'Client Portal',
};

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUserData();
    
    const userData = {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || '',
        role: user.role,
    };

    return (
        <NextAuthProvider>
            <SidebarProvider
                style={
                    {
                        '--sidebar-width': 'calc(var(--spacing) * 72)',
                        '--header-height': 'calc(var(--spacing) * 12)',
                    } as React.CSSProperties
                }
            >
                <AppSidebar user={userData} variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <main className="p-4">
                        {user?.isEmailVerified ? (
                            children
                        ) : (
                            <VerificationAlert email={user.email} />
                        )}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </NextAuthProvider>
    );
}
