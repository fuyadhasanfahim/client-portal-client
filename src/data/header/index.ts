export const SiteHeaders = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Orders',
        href: '/orders',
    },
    {
        title: 'Orders / New Order',
        href: '/orders/new-order',
    },
    {
        title: 'Orders / New Order / Order Details',
        href: '/orders/new-order/:id/details',
        match: /^\/orders\/new-order\/[^/]+\/details$/,
    },
    {
        title: 'Orders / New Order / Review Order',
        href: '/orders/new-order/:id/review',
        match: /^\/orders\/new-order\/[^/]+\/review$/,
    },
    {
        title: 'Services',
        href: '/services',
    },
];
