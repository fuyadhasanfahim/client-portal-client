'use client';

import { cn } from '@/lib/utils';
import { OrderStatusData } from '@/data/orders';
import { Button } from '../ui/button';
import ApiError from '../shared/ApiError';
import toast from 'react-hot-toast';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Check, Loader, X } from 'lucide-react';
import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { IQuote } from '@/types/quote.interface';
import { useUpdateQuoteMutation } from '@/redux/features/quotes/quoteApi';
import { socketEvents } from '@/utils/socket/socketEvents';

interface SelectQuoteStatusProps {
    quote: IQuote;
    role: string;
    quoteID: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    refetch?: any;
}

export default function SelectQuoteStatus({
    quote,
    role,
    quoteID,
    refetch,
}: SelectQuoteStatusProps) {
    const { user } = useLoggedInUser();

    const item = OrderStatusData.find((item) => item.value === quote.status);
    const [updateQuote, { isLoading }] = useUpdateQuoteMutation();

    const handleQuoteStatusChange = async ({
        quoteID,
        status,
    }: {
        quoteID: string;
        status: string;
    }) => {
        try {
            console.log(quoteID, status);
            const response = await updateQuote({
                quoteID,
                data: { status },
            }).unwrap();

            if (response.success)
                toast.success('Quote status updated successfully');
        } catch (error) {
            ApiError(error);
        }
    };

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

        const event = socketEvents.entity.statusUpdated('quote');

        function handleQuoteUpdate(updateData: {
            quoteID: string;
            status?: string;
            updatedAt?: Date;
        }) {
            if (updateData.quoteID === quoteID) {
                refetch();
            }
        }

        socket.connect();

        socket.emit(socketEvents.joinRoom('user'), user.userID);
        socket.emit(socketEvents.joinRoom('quote'), quoteID);

        socket.on(event, handleQuoteUpdate);

        return () => {
            socket.off(event, handleQuoteUpdate);
            socket.emit(socketEvents.leaveRoom('quote'), quoteID);
            socket.disconnect();
        };
    }, [quoteID, user?.userID, refetch]);

    return (
        <div className="flex items-center justify-center">
            {role && role === 'user' ? (
                <span className="flex items-center justify-center gap-2">
                    {quote.status === 'pending' ? (
                        <Loader size={16} className="animate-spin" />
                    ) : (
                        (() => {
                            const item = OrderStatusData.find(
                                (item) => item.value === quote.status
                            );
                            return item ? (
                                <item.icon
                                    size={16}
                                    className={cn(item.text)}
                                />
                            ) : null;
                        })()
                    )}
                    {quote.status}
                </span>
            ) : quote.status === 'pending' ? (
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={'ghost'}
                                size={'icon'}
                                disabled={isLoading}
                                onClick={() =>
                                    handleQuoteStatusChange({
                                        quoteID,
                                        status: 'canceled',
                                    })
                                }
                            >
                                <X className="text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Cancel the quote</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={'ghost'}
                                size={'icon'}
                                disabled={isLoading}
                                onClick={() =>
                                    handleQuoteStatusChange({
                                        quoteID,
                                        status: 'in-progress',
                                    })
                                }
                            >
                                <Check className="text-primary" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Accept the quote</TooltipContent>
                    </Tooltip>
                </div>
            ) : (
                <span
                    className={cn(
                        'flex items-center justify-center gap-1',
                        item && item.text
                    )}
                >
                    {item ? (
                        <item.icon size={16} className={cn(item.text)} />
                    ) : null}
                    {quote.status}
                </span>
            )}
        </div>
    );
}
