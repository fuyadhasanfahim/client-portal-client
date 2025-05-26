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
        title: 'Orders / New Order / Payment',
        href: '/orders/new-order/:id/payment',
        match: /^\/orders\/new-order\/[^/]+\/payment$/,
    },
    {
        title: 'Complete',
        href: '/orders/order-payment/complete',
    },
    {
        title: 'Services',
        href: '/services',
    },
];
