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
} from '@tabler/icons-react';

export const sidebarItems = [
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
        title: 'Invoices',
        url: '/invoices',
        icon: IconFileInvoice,
        access: ['admin', 'user'],
    },
    {
        title: 'Reports',
        url: '/reports',
        icon: IconReportAnalytics,
        access: ['admin', 'user'],
    },
];
