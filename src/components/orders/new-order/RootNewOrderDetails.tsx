'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useGetOrderQuery } from '@/redux/features/orders/ordersApi';
import OrderDetails from '@/components/orders/new-order/OrderDetails';
import SelectedServicesCard from '@/components/orders/new-order/SelectedServicesCard';
import SelectedServiceLoadingCard from './SelectedServiceLoadingCard';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function RootNewOrderDetails({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);
    const route = useRouter();
    const { data, isLoading, isError } = useGetOrderQuery({
        order_id: id,
        orderStatus: 'Awaiting For Details',
    });

    let content;

    if (isLoading) {
        content = <SelectedServiceLoadingCard />;
    } else if (!isLoading && isError) {
        content = (
            <Card className="max-w-2xl border border-red-300 bg-red-50 text-destructive rounded-xl shadow-sm">
                <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                    <p className="text-center text-base font-medium">
                        Error fetching draft order.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => route.push('/orders/new-order')}
                        className="border-destructive text-destructive hover:bg-red-100"
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    } else if (!isLoading && !isError && !data) {
        content = (
            <Card className="max-w-2xl">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-destructive">No draft order found.</p>
                </CardContent>
            </Card>
        );
    } else {
        content = (
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Selected Services
                    </CardTitle>
                    <CardDescription>
                        Here are the services you selected. If you need to make
                        any changes, please go back to the previous step.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SelectedServicesCard services={data.data?.services} />
                </CardContent>
            </Card>
        );
    }

    return (
        <section className="grid grid-cols-2 gap-6 items-start">
            <OrderDetails id={id} />
            {content}
        </section>
    );
}
