'use client';

import { useGetOrderQuery } from '@/redux/features/orders/ordersApi';
import OrderDetailsCard from './OrderDetailsCard';

export default function RootOrderDetails({
    id,
    status,
}: {
    id: string;
    status: string;
}) {
    const { data, isLoading, isError } = useGetOrderQuery({
        id,
        status,
    });

    let content;

    if (!data && !isError && isLoading) {
        content = <p>Loading...</p>;
    }
    if (!isLoading && !data) {
        content = <p>Order not found.</p>;
    }
    if (!isLoading && !isError && data) {
        content = <OrderDetailsCard order={data.data} />;
    }

    return content;
}
