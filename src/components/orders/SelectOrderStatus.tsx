'use client';

import { cn } from '@/lib/utils';
import { IconCheck, IconLoader, IconX } from '@tabler/icons-react';
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

interface SelectOrderStatusProps {
    order: IOrder;
    role: string;
    orderID: string;
}

export default function SelectOrderStatus({
    order,
    role,
    orderID,
}: SelectOrderStatusProps) {
    const item = OrderStatusData.find(
        (item) => item.value === order.orderStatus
    );
    const [updateOrder, { isLoading }] = useUpdateOrderMutation();

    const handleOrderStatusChange = async ({
        orderID,
        data,
    }: {
        orderID: string;
        data: { status: string; orderStatus: string };
    }) => {
        try {
            const response = await updateOrder({
                orderID,
                data,
            }).unwrap();

            if (response.success)
                toast.success('Order status updated successfully');
        } catch (error) {
            ApiError(error);
        }
    };
    return (
        <div className="flex items-center justify-center">
            {role && role === 'User' ? (
                <span className="flex items-center justify-center gap-2">
                    {order.orderStatus === 'Waiting For Approval' ? (
                        <IconLoader size={16} className="animate-spin" />
                    ) : (
                        (() => {
                            const item = OrderStatusData.find(
                                (item) => item.value === order.orderStatus
                            );
                            return item ? (
                                <item.icon
                                    size={16}
                                    className={cn(item.text)}
                                />
                            ) : null;
                        })()
                    )}
                    {order.orderStatus}
                </span>
            ) : order.orderStatus === 'Waiting For Approval' ? (
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
                                        data: {
                                            status: 'Canceled',
                                            orderStatus: 'Canceled',
                                        },
                                    })
                                }
                            >
                                <IconX className="text-destructive" />
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
                                        data: {
                                            status: 'In Progress',
                                            orderStatus: 'Accepted',
                                        },
                                    })
                                }
                            >
                                <IconCheck className="text-primary" />
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
                    {order.orderStatus}
                </span>
            )}
        </div>
    );
}
