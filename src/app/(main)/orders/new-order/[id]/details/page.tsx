'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useGetDraftOrderQuery } from '@/redux/features/orders/ordersApi';
import { useForm } from 'react-hook-form';
import OrderDetails from '@/components/orders/new-order/OrderDetails';
import SelectedServicesCard from '@/components/orders/new-order/SelectedServicesCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewOrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);

    const form = useForm({
        defaultValues: {
            downloadLink: '',
            images: '',
            returnFileFormat: '',
            backgroundOption: '',
            imageResizing: 'No',
            width: 0,
            height: 0,
            instructions: '',
            supportingFileDownloadLink: '',
        },
    });

    const { data, isLoading, isError } = useGetDraftOrderQuery(id);

    let content;

    if (isLoading) {
        content = (
            <Card className="max-w-2xl">
                <CardHeader>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    } else if (!isLoading && isError) {
        content = (
            <Card className="max-w-2xl">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-destructive">
                        Error fetching draft order.
                    </p>
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
                    <SelectedServicesCard services={data.data.services} />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-6 items-start">
            <OrderDetails form={form} />
            {content}
        </div>
    );
}
