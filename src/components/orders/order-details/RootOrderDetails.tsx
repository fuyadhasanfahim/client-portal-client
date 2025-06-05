'use client';

import { useGetOrderQuery } from '@/redux/features/orders/ordersApi';
import OrderDetailsCard from './OrderDetailsCard';

export default function RootOrderDetails({
    orderID,
    user,
}: {
    orderID: string;
    user: {
        userID: string;
        name: string;
        email: string;
        role: string;
        profileImage: string;
    };
}) {
    const { data, isLoading, isError } = useGetOrderQuery({
        order_id: orderID,
    });

    let content;

    if (!data && !isError && isLoading) {
        content = <p>Loading...</p>;
    }
    if (!isLoading && !isError && !data) {
        content = <p>Order not found.</p>;
    }
    if (!isLoading && !isError && data) {
        content = <OrderDetailsCard order={data.data} user={user} />;
    }

    return content;
}
