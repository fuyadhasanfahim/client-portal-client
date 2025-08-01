'use client';

import { cn } from '@/lib/utils';
import { OrderStatusData } from '@/data/orders';
import { IOrder } from '@/types/order.interface';
import { Button } from '../ui/button';
import { useUpdateOrderMutation } from '@/redux/features/orders/ordersApi';
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

interface SelectOrderStatusProps {
    order: IOrder;
    role: string;
    orderID: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    refetch?: any;
}

export default function SelectOrderStatus({
    order,
    role,
    orderID,
    refetch,
}: SelectOrderStatusProps) {
    const { user } = useLoggedInUser();

    const item = OrderStatusData.find((item) => item.value === order.status);
    const [updateOrder, { isLoading }] = useUpdateOrderMutation();

    const handleOrderStatusChange = async ({
        orderID,
        status,
    }: {
        orderID: string;
        status: string;
    }) => {
        try {
            console.log(orderID, status);
            const response = await updateOrder({
                orderID,
                data: { status },
            }).unwrap();

            if (response.success)
                toast.success('Order status updated successfully');
        } catch (error) {
            ApiError(error);
        }
    };

    useEffect(() => {
        if (!orderID || !user?.userID) return;

        function handleOrderUpdate(updateData: {
            orderID: string;
            status?: string;
            updatedAt?: Date;
        }) {
            if (updateData.orderID === orderID) {
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
    }, [orderID, user?.userID, refetch]);

    return (
        <div className="flex items-center justify-center">
            {role && role === 'user' ? (
                <span className="flex items-center justify-center gap-2">
                    {order.status === 'pending' ? (
                        <Loader size={16} className="animate-spin" />
                    ) : (
                        (() => {
                            const item = OrderStatusData.find(
                                (item) => item.value === order.status
                            );
                            return item ? (
                                <item.icon
                                    size={16}
                                    className={cn(item.text)}
                                />
                            ) : null;
                        })()
                    )}
                    {order.status}
                </span>
            ) : order.status === 'pending' ? (
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={'ghost'}
                                size={'icon'}
                                disabled={isLoading}
                                onClick={() =>
                                    handleOrderStatusChange({
                                        orderID,
                                        status: 'canceled',
                                    })
                                }
                            >
                                <X className="text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Cancel the order</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={'ghost'}
                                size={'icon'}
                                disabled={isLoading}
                                onClick={() =>
                                    handleOrderStatusChange({
                                        orderID,
                                        status: 'in-progress',
                                    })
                                }
                            >
                                <Check className="text-primary" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Accept the order</TooltipContent>
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
                    {order.status}
                </span>
            )}
        </div>
    );
}
