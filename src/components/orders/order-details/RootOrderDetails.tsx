'use client';

import { useGetOrderByIDQuery } from '@/redux/features/orders/ordersApi';
import OrderDetailsCard from './OrderDetailsCard';
import { Loader } from 'lucide-react';

export default function RootOrderDetails({ orderID }: { orderID: string }) {
    const { data, isLoading, isError } = useGetOrderByIDQuery(orderID, {
        skip: !orderID,
    });

    let content;

    if (!data && !isError && isLoading) {
        content = (
            <div className="min-h-[80vh] w-full flex items-center justify-center">
                <Loader className="size-5 animate-spin" />
            </div>
        );
    }
    if (!isLoading && !isError && !data) {
        content = (
            <div className="min-h-[80vh] w-full flex items-center justify-center">
                <p className="text-destructive">Order not found.</p>
            </div>
        );
    }
    if (!isLoading && !isError && data) {
        content = <OrderDetailsCard order={data.data} />;
    }

    return content;
}
