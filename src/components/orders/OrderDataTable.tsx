'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    EyeIcon,
    Download,
    Funnel,
    NotebookText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    useGetOrdersQuery,
    useUpdateOrderMutation,
} from '@/redux/features/orders/ordersApi';
import { IOrder } from '@/types/order.interface';
import toast from 'react-hot-toast';
import ApiError from '../shared/ApiError';
import SelectStatus from './SelectStatus';
import { cn } from '@/lib/utils';
import { IconLoader } from '@tabler/icons-react';
import { OrderStatusData, statusData } from '@/data/orders';
import Link from 'next/link';
import OrderStats from './OrderStats';
import SelectOrderStatus from './SelectOrderStatus';
import OrderPaymentStatus from './OrderPaymentStatus';

export default function OrderDataTable({
    role,
    id,
}: {
    role: string;
    id: string;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [quantity, setQuantity] = useState(10);

    const { data, isLoading } = useGetOrdersQuery({
        params: {
            page: currentPage,
            quantity,
            searchQuery,
            user_id: id,
            user_role: role,
            filter,
        },
    });
    const [updateOrder, { isLoading: isStatusUpdating }] =
        useUpdateOrderMutation();

    const orders = !isLoading && data.data;
    const pagination = !isLoading && data.pagination;

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleStatusChange = async ({
        id,
        data,
    }: {
        id: string;
        data: { status: string };
    }) => {
        try {
            let response;
            if (data.status === 'Canceled') {
                response = await updateOrder({
                    id,
                    data: { status: data.status, orderStatus: 'Canceled' },
                }).unwrap();
            }

            response = await updateOrder({
                id,
                data: { status: data.status },
            }).unwrap();
            if (response.success)
                toast.success('Order status updated successfully');
        } catch (error) {
            ApiError(error);
        }
    };

    const handleOrderStatusChange = async ({
        id,
        data,
    }: {
        id: string;
        data: { orderStatus: string };
    }) => {
        try {
            let response;

            if (data.orderStatus === 'Canceled') {
                response = await updateOrder({
                    id,
                    data: { orderStatus: data.orderStatus, status: 'Canceled' },
                }).unwrap();
            }

            if (data.orderStatus === 'Accepted') {
                response = await updateOrder({
                    id,
                    data: { orderStatus: data.orderStatus, status: 'Pending' },
                }).unwrap();
            }

            response = await updateOrder({
                id,
                data: { orderStatus: data.orderStatus },
            }).unwrap();
            if (response.success)
                toast.success('Order status updated successfully');
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <OrderStats data={data} isLoading={isLoading} />

            <div className="flex flex-row items-center justify-between">
                <form onSubmit={handleSearch} className="w-full max-w-sm">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </form>

                <div className="flex items-center gap-4">
                    <Button variant={'secondary'}>
                        <Download />
                        Export
                    </Button>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Funnel size={16} />
                                Filter:
                            </span>
                            <Select
                                value={filter}
                                onValueChange={(value) => setFilter(value)}
                            >
                                <SelectTrigger className="w-32 h-9">
                                    <SelectValue placeholder={filter} />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        'All',
                                        'Active',
                                        'Completed',
                                        'Canceled',
                                    ].map((val) => (
                                        <SelectItem key={val} value={val}>
                                            {val}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <NotebookText size={16} /> Show:
                            </span>
                            <Select
                                value={quantity.toString()}
                                onValueChange={(value) =>
                                    setQuantity(Number(value))
                                }
                            >
                                <SelectTrigger className="w-24 h-9">
                                    <SelectValue placeholder={quantity} />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 25, 50, 100].map((val) => (
                                        <SelectItem
                                            key={val}
                                            value={val.toString()}
                                        >
                                            {val}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-background">
                <Table>
                    <TableHeader className="bg-accent text-primary-foreground">
                        <TableRow>
                            {[
                                'Order ID',
                                'Client',
                                'Services',
                                'Total ($)',
                                'Payment ($)',
                                'Status',
                                'Order Status',
                                'Actions',
                            ].map((title, idx) => (
                                <TableHead
                                    key={idx}
                                    className="text-center font-semibold border-r last:border-r-0"
                                >
                                    {title}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <TableRow key={`loading-${i}`}>
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <TableCell
                                            key={j}
                                            className="text-center"
                                        >
                                            <Skeleton className="h-6 w-full mx-auto" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center py-8"
                                >
                                    <p className="text-gray-500">
                                        No orders found
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order: IOrder, index: number) => (
                                <TableRow
                                    key={index}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="text-center font-medium border-r">
                                        <Link
                                            href={`/orders/details?id=${order._id}&status=${order.status}`}
                                            className="text-primary underline"
                                        >
                                            #{order._id}
                                        </Link>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            'text-center text-sm border-r',
                                            order.orderStatus === 'Canceled' &&
                                                'cursor-not-allowed text-destructive'
                                        )}
                                    >
                                        {order.userId}
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            'text-start text-sm border-r',
                                            order.orderStatus === 'Canceled' &&
                                                'cursor-not-allowed text-destructive'
                                        )}
                                    >
                                        <ul className="list-decimal list-inside space-y-1">
                                            {order.services.map((service) => (
                                                <li key={service.name}>
                                                    {service.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            'text-center text-sm border-r',
                                            order.orderStatus === 'Canceled' &&
                                                'cursor-not-allowed text-destructive'
                                        )}
                                    >
                                        ${order.total?.toFixed(2) || 0}
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            'text-center text-sm border-r',
                                            order.orderStatus === 'Canceled' &&
                                                'cursor-not-allowed text-destructive'
                                        )}
                                    >
                                        <OrderPaymentStatus
                                            paymentStatus={order.paymentStatus}
                                        />
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            'text-center text-sm border-r',
                                            order.orderStatus === 'Canceled' &&
                                                'cursor-not-allowed text-destructive'
                                        )}
                                    >
                                        <span className="flex items-center justify-center">
                                            <SelectStatus
                                                disabled={
                                                    order.orderStatus ===
                                                    'Waiting For Approval'
                                                }
                                                data={statusData}
                                                handleUpdateStatus={
                                                    handleStatusChange
                                                }
                                                id={order._id!}
                                                status={order.status}
                                                isStatusUpdating={
                                                    isStatusUpdating
                                                }
                                                role={role}
                                            />
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            'text-center text-sm border-r',
                                            role === 'User' &&
                                                order.orderStatus ===
                                                    'Canceled' &&
                                                'cursor-not-allowed text-destructive'
                                        )}
                                    >
                                        {role && role === 'User' ? (
                                            <span className="flex items-center justify-center gap-2">
                                                {order.orderStatus ===
                                                'Waiting For Approval' ? (
                                                    <IconLoader
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    (() => {
                                                        const item =
                                                            OrderStatusData.find(
                                                                (item) =>
                                                                    item.value ===
                                                                    order.orderStatus
                                                            );
                                                        return item ? (
                                                            <item.icon
                                                                size={16}
                                                                className={cn(
                                                                    item.text
                                                                )}
                                                            />
                                                        ) : null;
                                                    })()
                                                )}
                                                {order.orderStatus}
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center">
                                                <SelectOrderStatus
                                                    data={OrderStatusData}
                                                    handleOrderStatusChange={
                                                        handleOrderStatusChange
                                                    }
                                                    id={order._id!}
                                                    status={order.orderStatus}
                                                    isStatusUpdating={
                                                        isStatusUpdating
                                                    }
                                                />
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Link
                                            href={`/orders/details?order_id=${order._id!}`}
                                            className="flex items-center justify-center gap-2 group"
                                        >
                                            <EyeIcon size={20} />{' '}
                                            <span className="group-hover:underline cursor-pointer">
                                                Details
                                            </span>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
                <div>
                    Showing{' '}
                    {pagination.total > 0
                        ? `${(currentPage - 1) * quantity + 1} to ${Math.min(
                              currentPage * quantity,
                              pagination.total
                          )}`
                        : '0'}{' '}
                    of {pagination.total} entries
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={
                            currentPage === pagination.totalPages || isLoading
                        }
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
