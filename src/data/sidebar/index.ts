import {
    IconBrandMinecraft,
    IconDashboard,
    IconFileInvoice,
    IconMessage,
    IconPackage,
    IconServer,
} from '@tabler/icons-react';

export const sidebarItems = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: IconDashboard,
        access: ['Admin', 'User', 'SuperAdmin', 'Developer'],
    },
    {
        title: 'Orders',
        url: '/orders',
        icon: IconPackage,
        access: ['Admin', 'User', 'SuperAdmin', 'Developer'],
    },
    {
        title: 'Drafts',
        url: '/drafts',
        icon: IconBrandMinecraft,
        access: ['Admin', 'User', 'SuperAdmin', 'Developer'],
    },
    {
        title: 'Services',
        url: '/services',
        icon: IconServer,
        access: ['Admin', 'SuperAdmin', 'Developer'],
    },
    {
        title: 'Messages',
        url: '/messages',
        icon: IconMessage,
        access: ['Admin', 'SuperAdmin', 'Developer'],
    },
    {
        title: 'Invoices',
        url: '/invoices',
        icon: IconFileInvoice,
        access: ['Admin', 'SuperAdmin', 'Developer'],
    },
];
