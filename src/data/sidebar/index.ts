// data/sidebar.ts
import {
    IconBrandMinecraft,
    IconDashboard,
    IconFileInvoice,
    IconMessage,
    IconPackage,
    IconPackageExport,
    IconReportAnalytics,
    IconServer,
    IconUsers,
    IconUsersGroup,
} from '@tabler/icons-react';

export type UserRole = 'admin' | 'user';
export type TeamPermKey =
    | 'viewPrices'
    | 'createOrders'
    | 'exportInvoices'
    | 'viewAllServices';

export type SidebarItem = {
    title: string;
    url: string;
    icon: any;
    access: UserRole[];
    hideForTeamMember?: boolean;
    requireTeamPerm?: TeamPermKey | TeamPermKey[];
};

export const sidebarItems: SidebarItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: IconDashboard,
        access: ['admin', 'user'],
    },
    {
        title: 'Orders',
        url: '/orders',
        icon: IconPackage,
        access: ['admin', 'user'],
        requireTeamPerm: 'createOrders',
    },
    {
        title: 'Quotes',
        url: '/quotes',
        icon: IconPackageExport,
        access: ['admin', 'user'],
    },
    {
        title: 'Drafts',
        url: '/drafts',
        icon: IconBrandMinecraft,
        access: ['admin', 'user'],
    },
    {
        title: 'Clients',
        url: '/clients',
        icon: IconUsers,
        access: ['admin'],
    },
    {
        title: 'Services',
        url: '/services',
        icon: IconServer,
        access: ['admin'],
    },
    {
        title: 'Messages',
        url: '/messages',
        icon: IconMessage,
        access: ['admin'],
    },
    {
        title: 'Team Members',
        url: '/team-members',
        icon: IconUsersGroup,
        access: ['admin', 'user'],
        hideForTeamMember: true,
    },
    {
        title: 'Invoices',
        url: '/invoices',
        icon: IconFileInvoice,
        access: ['admin', 'user'],
        requireTeamPerm: 'exportInvoices',
    },
    {
        title: 'Reports',
        url: '/reports',
        icon: IconReportAnalytics,
        access: ['admin', 'user'],
    },
];
