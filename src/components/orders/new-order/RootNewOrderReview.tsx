'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetDraftOrderQuery } from '@/redux/features/orders/ordersApi';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import NewOrderPricingCard from './NewOrderPricingCard';

export default function RootNewOrderReview({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data, isLoading, isError } = useGetDraftOrderQuery({
        id,
        status: 'waiting-for-approval',
    });

    console.log(data)

    let content;

    if (isLoading) {
        content = (
            <Card className="max-w-2xl mx-auto animate-pulse">
                <CardHeader className="space-y-2">
                    <CardTitle>
                        <Skeleton className="h-6 w-1/3 rounded-md" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-2/3 rounded" />
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-1/4 rounded" />
                            <Skeleton className="h-4 w-full rounded" />
                            <Skeleton className="h-4 w-5/6 rounded" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    } else if (!isLoading && isError) {
        content = (
            <Card className="max-w-2xl mx-auto border border-red-300 bg-red-50 text-destructive rounded-xl shadow-sm">
                <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                    <p className="text-center text-base font-medium">
                        Error fetching draft order.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/orders/new-order')}
                        className="border-destructive text-destructive hover:bg-red-100"
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    } else if (!isLoading && !isError && !data) {
        content = (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-destructive">No draft order found.</p>
                </CardContent>
            </Card>
        );
    } else {
        content = <NewOrderPricingCard order={data.data} />;
    }

    return content;
}
