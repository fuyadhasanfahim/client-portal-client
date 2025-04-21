import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import NextAuthProvider from './NextAuthProvider';
import { Session } from 'next-auth';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export default function RootLayout({
    children,
    session,
}: Readonly<{
    children: React.ReactNode;
    session: Session | null;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NextAuthProvider session={session}>
                    {children}
                    <Toaster />
                </NextAuthProvider>
            </body>
        </html>
    );
}
