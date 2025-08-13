import { ReactNode } from 'react';
import NextAuthProvider from './NextAuthProvider';
import ReduxProvider from './ReduxProvider';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <NextAuthProvider>
            <ReduxProvider>
                {children}
                <Toaster position="bottom-right" reverseOrder={false} />
            </ReduxProvider>
        </NextAuthProvider>
    );
}
