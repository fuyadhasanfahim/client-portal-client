'use client';

import QuoteDetailsCard from './QuoteDetailsCard';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { useGetQuoteByIDQuery } from '@/redux/features/quotes/quoteApi';

export default function RootQuoteDetails({ quoteID }: { quoteID: string }) {
    const { user } = useLoggedInUser();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { data, isLoading, isError, refetch } = useGetQuoteByIDQuery(
        quoteID,
        {
            skip: !quoteID,
        }
    );

    useEffect(() => {
        if (!quoteID || !user?.userID) return;

        function handleOrderUpdate(updateData: {
            orderID: string;
            status?: string;
            updatedAt?: Date;
        }) {
            if (updateData.orderID === quoteID && !isSubmitting) {
                refetch();
            }
        }

        socket.connect();
        socket.emit('join-user-room', user.userID);
        socket.emit('join-order-room', quoteID);

        socket.on('order-status-updated', handleOrderUpdate);

        return () => {
            socket.off('order-status-updated', handleOrderUpdate);
            socket.emit('leave-order-room', quoteID);
        };
    }, [quoteID, user?.userID, refetch, isSubmitting]);

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
            <QuoteDetailsCard
                quote={data.data}
                setIsSubmitting={setIsSubmitting}
            />
        );
    }

    return null;
}
