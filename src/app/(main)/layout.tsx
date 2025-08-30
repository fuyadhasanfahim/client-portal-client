import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import NextAuthProvider from '../../components/providers/NextAuthProvider';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { SiteHeader } from '@/components/shared/site-header';
import { getUserData } from '@/actions/user.action';
import VerificationAlert from '@/components/shared/VerificationAlert';
import { Metadata } from 'next';
import AdditionalInformationAlert from '@/components/shared/AdditionalInformationAlert';
import MessagesFabProvider from '@/components/providers/MessagesFabProvider';

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

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    const userData = {
        id: user.userID,
        name: user.name,
        email: user.email,
        image: user.image || '',
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
                <AppSidebar user={userData} />
                <SidebarInset>
                    <SiteHeader user={userData} />
                    <main className="p-4">
                        {!user?.isEmailVerified ? (
                            <VerificationAlert email={user.email} />
                        ) : !user?.address || !user.phone ? (
                            <AdditionalInformationAlert
                                userPhone={user.phone}
                                userAddress={user.address}
                                userCompany={user.company}
                                userID={user.userID}
                            />
                        ) : (
                            children
                        )}
                    </main>
                    <MessagesFabProvider />
                </SidebarInset>
            </SidebarProvider>
        </NextAuthProvider>
    );
}
