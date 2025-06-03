import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { IOrder } from '@/types/order.interface';
import { Skeleton } from '../ui/skeleton';
import {
    IconPackageOff,
    IconCheckbox,
    IconClock,
    IconPackage,
} from '@tabler/icons-react';

export default function OrderStats({
    data,
    isLoading,
}: {
    data: {
        data: IOrder[];
        pagination: {
            total: number;
        };
    };
    isLoading: boolean;
}) {

    const stats = [
        {
            title: 'Active Orders',
            value:
                !isLoading &&
                data.data.filter((order) =>
                    ['In Progress', 'In Revision', 'Delivered'].includes(
                        order.status
                    )
                ).length,
            icon: IconPackage,
            color: 'from-sky-500 to-blue-600',
            change: '+12%',
        },
        {
            title: 'Completed Orders',
            value:
                !isLoading &&
                data.data.filter((order) =>
                    ['Completed'].includes(order.status)
                ).length,
            icon: IconClock,
            color: 'from-green-500 to-teal-600',
            change: '+8%',
        },
        {
            title: 'Pending Orders',
            value:
                !isLoading &&
                data.data.filter((order) => ['Pending'].includes(order.status))
                    .length,
            icon: IconCheckbox,
            color: 'from-yellow-500 to-orange-500',
            change: '+15%',
        },
        {
            title: 'Canceled Orders',
            value:
                !isLoading &&
                data.data.filter((order) => ['Canceled'].includes(order.status))
                    .length,
            icon: IconPackageOff,
            color: 'from-orange-500 to-red-600',
            change: '+23%',
        },
    ];
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
                <Card key={i}>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {s.title}
                            </p>
                            {isLoading ? (
                                <Skeleton className="w-8 h-6" />
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">
                                    {s.value}
                                </p>
                            )}

                            <p className="text-sm text-green-600 font-medium mt-1">
                                {s.change} from last week
                            </p>
                        </div>
                        <div
                            className={cn(
                                'p-3 rounded-xl shadow-inner bg-gradient-to-r text-white',
                                s.color
                            )}
                        >
                            <s.icon size={28} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
