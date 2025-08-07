'use client';

import { useGetOrderByIDQuery } from '@/redux/features/orders/ordersApi';
import OrderDetailsCard from './OrderDetailsCard';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { socketEvents } from '@/utils/socket/socketEvents';

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
        if (!user?.id) return;

        socket.connect();
        socket.emit('join', user.id);

        socket.on('new-notification', () => {
            refetch();
        });

        return () => {
            socket.off('new-notification');
            socket.disconnect();
        };
    }, [user?.id, refetch]);

    useEffect(() => {
        if (!orderID || !user?.userID) return;

        const statusUpdatedEvent = socketEvents.entity.statusUpdated('order');
        const joinUserRoomEvent = socketEvents.joinRoom('user');
        const joinOrderRoomEvent = socketEvents.joinRoom('order');
        const leaveOrderRoomEvent = socketEvents.leaveRoom('order');

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
        socket.emit(joinUserRoomEvent, user.userID);
        socket.emit(joinOrderRoomEvent, orderID);
        socket.on(statusUpdatedEvent, handleOrderUpdate);

        return () => {
            socket.off(statusUpdatedEvent, handleOrderUpdate);
            socket.emit(leaveOrderRoomEvent, orderID);
            socket.disconnect();
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
        return (
            <OrderDetailsCard
                order={data.data}
                setIsSubmitting={setIsSubmitting}
            />
        );
    }

    return null;
}
