import {
    IconBrandMinecraft,
    IconDashboard,
    IconFileInvoice,
    IconMessage,
    IconPackage,
    IconReportAnalytics,
    IconServer,
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
        title: 'Drafts',
        url: '/drafts',
        icon: IconBrandMinecraft,
        access: ['admin', 'user'],
    },
    {
        title: 'Services',
        url: '/services',
        icon: IconServer,
        access: ['user'],
    },
    {
        title: 'Messages',
        url: '/messages',
        icon: IconMessage,
        access: ['user'],
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
