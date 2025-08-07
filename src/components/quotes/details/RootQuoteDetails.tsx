'use client';

import QuoteDetailsCard from './QuoteDetailsCard';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { useGetQuoteByIDQuery } from '@/redux/features/quotes/quoteApi';
import { socketEvents } from '@/utils/socket/socketEvents';

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
        if (!quoteID || !user?.userID) return;

        const statusUpdatedEvent = socketEvents.entity.statusUpdated('quote');
        const joinUserRoomEvent = socketEvents.joinRoom('user');
        const joinQuoteRoomEvent = socketEvents.joinRoom('quote');
        const leaveQuoteRoomEvent = socketEvents.leaveRoom('quote');

        function handleQuoteUpdate(updateData: {
            quoteID: string;
            status?: string;
            updatedAt?: Date;
        }) {
            if (updateData.quoteID === quoteID && !isSubmitting) {
                refetch();
            }
        }

        socket.connect();
        socket.emit(joinUserRoomEvent, user.userID);
        socket.emit(joinQuoteRoomEvent, quoteID);
        socket.on(statusUpdatedEvent, handleQuoteUpdate);

        return () => {
            socket.off(statusUpdatedEvent, handleQuoteUpdate);
            socket.emit(leaveQuoteRoomEvent, quoteID);
            socket.disconnect();
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
                <p className="text-destructive">Quote not found.</p>
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
