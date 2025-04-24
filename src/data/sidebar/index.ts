import { IconDashboard, IconServer } from '@tabler/icons-react';

export const sidebarItems = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: IconDashboard,
        access: ['Admin', 'User', 'SuperAdmin', 'Developer'],
    },
    {
        title: 'Services',
        url: '/services',
        icon: IconServer,
        access: ['Admin', 'SuperAdmin', 'Developer'],
    },
];
