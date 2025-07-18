'use client';

import { useGetOrderByIDQuery } from '@/redux/features/orders/ordersApi';
import OrderDetailsCard from './OrderDetailsCard';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import useLoggedInUser from '@/utils/getLoggedInUser';

export default function RootOrderDetails({ orderID }: { orderID: string }) {
    const { user } = useLoggedInUser();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { data, isLoading, isError, refetch } = useGetOrderByIDQuery(
        orderID,
        {
            skip: !orderID,
        }
    );

    useEffect(() => {
        if (!orderID || !user?.userID) return;

        function handleOrderUpdate(updateData: {
            orderID: string;
            status?: string;
            updatedAt?: Date;
        }) {
            if (updateData.orderID === orderID && !isSubmitting) {
                refetch();
            }
        }

        socket.connect();
        socket.emit('join-user-room', user.userID);
        socket.emit('join-order-room', orderID);

        socket.on('order-status-updated', handleOrderUpdate);

        return () => {
            socket.off('order-status-updated', handleOrderUpdate);
            socket.emit('leave-order-room', orderID);
        };
    }, [orderID, user?.userID, refetch, isSubmitting]);

    if (!data && !isError && isLoading) {
        return (
            <div className="min-h-[80vh] w-full flex items-center justify-center">
                <Loader className="size-5 animate-spin" />
            </div>
        );
    }

    if (!isLoading && !isError && !data) {
        return (
            <div className="min-h-[80vh] w-full flex items-center justify-center">
                <p className="text-destructive">Order not found.</p>
            </div>
        );
    }

    if (data) {
        return <OrderDetailsCard order={data.data} setIsSubmitting={setIsSubmitting} />;
    }

    return null;
}
