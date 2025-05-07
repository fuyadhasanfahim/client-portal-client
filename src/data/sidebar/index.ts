import { IconDashboard, IconServer } from '@tabler/icons-react';
import { Package2 } from 'lucide-react';

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
        icon: Package2,
        access: ['Admin', 'User', 'SuperAdmin', 'Developer'],
    },
    {
        title: 'Services',
        url: '/services',
        icon: IconServer,
        access: ['Admin', 'SuperAdmin', 'Developer'],
    },
];
