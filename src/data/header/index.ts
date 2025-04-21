export const breadcrumbs: Record<string, { title: string; href: string }[]> = {
    dashboard: [{ title: 'Dashboard', href: '/dashboard' }],
    'dashboard-user': [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'User', href: '/dashboard/user' },
    ],
    'dashboard-orders': [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/dashboard/orders' },
    ],
};
