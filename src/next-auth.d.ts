import { DefaultSession } from 'next-auth';

type TeamPermissions = {
    viewPrices?: boolean;
    createOrders?: boolean;
    exportInvoices?: boolean;
    viewAllServices?: boolean;
};

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession['user'];
        accessToken: string;
        ownerUserID?: string | null;
        permissions?: TeamPermissions;
    }
}
