'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import SetUser from './setUser';

type Props = {
    children: React.ReactNode;
};

const NextAuthProvider = ({ children }: Props) => {
    return (
        <SessionProvider>
            <SetUser />
            {children}
        </SessionProvider>
    );
};

export default NextAuthProvider;
