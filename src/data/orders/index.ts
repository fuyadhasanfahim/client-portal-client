import {
    IconCancel,
    IconCircleCheck,
    IconLoader,
    IconProgress,
    IconProgressCheck,
    IconUserQuestion,
} from '@tabler/icons-react';

export const statusData = [
    {
        id: 1,
        value: 'Pending',
        icon: IconLoader,
        text: '!text-yellow-500',
        accessibleTo: ['Admin', 'SuperAdmin', 'Developer'],
    },
    {
        id: 2,
        value: 'In Progress',
        icon: IconProgress,
        text: '!text-blue-500',
        accessibleTo: ['Admin', 'SuperAdmin', 'Developer'],
    },
    {
        id: 3,
        value: 'Delivered',
        icon: IconCircleCheck,
        text: '!text-greed-500',
        accessibleTo: ['Admin', 'SuperAdmin', 'Developer'],
    },
    {
        id: 4,
        value: 'In Revision',
        icon: IconUserQuestion,
        text: '!text-amber-500',
        accessibleTo: ['User'],
    },
    {
        id: 5,
        value: 'Completed',
        icon: IconProgressCheck,
        text: '!text-green-500',
        accessibleTo: ['User'],
    },
    {
        id: 6,
        value: 'Cancelled',
        icon: IconCancel,
        text: '!text-destructive',
        accessibleTo: ['Admin', 'SuperAdmin', 'Developer'],
    },
];

export const OrderStatusData = [
    {
        id: 'accepted',
        value: 'Accepted',
        icon: IconProgressCheck,
        text: '!text-green-500',
    },
    {
        id: 'cancelled',
        value: 'Cancelled',
        icon: IconCancel,
        text: '!text-destructive',
    },
];
