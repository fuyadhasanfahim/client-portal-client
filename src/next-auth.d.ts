import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export type TeamPermissions = {
    viewPrices?: boolean;
    createOrders?: boolean;
    exportInvoices?: boolean;
};

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: string;
            accessToken: string;
        } & DefaultSession['user'];
        accessToken: string;
    }

    interface User extends DefaultUser {
        id: string;
        role: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
        accessToken?: string;
    }
}
