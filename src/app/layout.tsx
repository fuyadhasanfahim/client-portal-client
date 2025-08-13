import './globals.css';
import Providers from './Providers';

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
                {children}
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
