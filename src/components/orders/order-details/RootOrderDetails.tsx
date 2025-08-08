'use client';

import { useGetOrderByIDQuery } from '@/redux/features/orders/ordersApi';
import OrderDetailsCard from './OrderDetailsCard';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import useLoggedInUser from '@/utils/getLoggedInUser';

export default function RootOrderDetails({ orderID }: { orderID: string }) {
    const { user } = useLoggedInUser();

    const { data, isLoading, isError, refetch } = useGetOrderByIDQuery(
        orderID,
        {
            skip: !orderID,
        }
    );

    useEffect(() => {
        if (!orderID || !user?.userID) return;

        socket.connect();

        socket.emit('join-user-room', user.userID);
        socket.emit('join-order-room', orderID);

        const handleNotification = () => {
            refetch();
        };

        const handleOrderUpdate = () => {
            refetch();
        };

        socket.on('new-notification', handleNotification);
        socket.on('order-updated', handleOrderUpdate);

        return () => {
            socket.off('new-notification', handleNotification);
            socket.off('order-updated', handleOrderUpdate);
            socket.emit('leave-order-room', orderID);
        };
    }, [orderID, user?.userID, refetch]);

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
        return (
            <OrderDetailsCard
                order={data.data}
            />
        );
    }

    return null;
}
