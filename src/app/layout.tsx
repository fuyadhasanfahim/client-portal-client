import './globals.css';
import NextAuthProvider from './NextAuthProvider';
import { Toaster } from 'react-hot-toast';
import ReduxProvider from './ReduxProvider';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://api.fontshare.com/v2/css?f[]=synonym@1&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className={`antialiased`}>
                <NextAuthProvider>
                    <ReduxProvider>
                        {children}
                        <Toaster position="bottom-right" reverseOrder={false} />
                    </ReduxProvider>
                </NextAuthProvider>
            </body>
        </html>
    );
}
