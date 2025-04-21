export const breadcrumbs: Record<string, { title: string; href: string }[]> = {
    dashboard: [{ title: 'Dashboard', href: '/dashboard' }],
    account: [
        { title: 'Account', href: '/account' },
        { title: 'Profile', href: '/account/profile' },
    ],
    'dashboard-orders': [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/dashboard/orders' },
    ],
};
