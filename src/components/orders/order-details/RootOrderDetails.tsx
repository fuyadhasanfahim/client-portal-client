'use client';

import { useGetOrderByIDQuery } from '@/redux/features/orders/ordersApi';
import OrderDetailsCard from './OrderDetailsCard';

export default function RootOrderDetails({ orderID }: { orderID: string }) {
    const { data, isLoading, isError } = useGetOrderByIDQuery(orderID, {
        skip: !orderID,
    });

    let content;

    if (!data && !isError && isLoading) {
        content = <p>Loading...</p>;
    }
    if (!isLoading && !isError && !data) {
        content = <p>Order not found.</p>;
    }
    if (!isLoading && !isError && data) {
        content = <OrderDetailsCard order={data.data} />;
    }

    return content;
}
