import { CheckCircle, Clock, DollarSign, Package } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { IOrder } from '@/types/order.interface';
import { Skeleton } from '../ui/skeleton';

export default function OrderStats({
    data,
    isLoading,
}: {
    data: {
        orders: IOrder[];
        pagination: {
            total: number;
        };
    };
    isLoading: boolean;
}) {
    console.log(data);

    const stats = [
        {
            title: 'Total Orders',
            value: !isLoading && data.pagination.total,
            icon: Package,
            color: 'from-blue-500 to-blue-600',
            change: '+12%',
        },
        {
            title: 'Active Orders',
            value: '23',
            icon: Clock,
            color: 'from-amber-500 to-orange-500',
            change: '+8%',
        },
        {
            title: 'Completed',
            value: '18',
            icon: CheckCircle,
            color: 'from-emerald-500 to-green-600',
            change: '+15%',
        },
        {
            title: 'Revenue',
            value: '$12.4k',
            icon: DollarSign,
            color: 'from-purple-500 to-pink-500',
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
