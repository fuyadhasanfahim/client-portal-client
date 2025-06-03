'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    EyeIcon,
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
import { useGetOrdersQuery } from '@/redux/features/orders/ordersApi';
import { IOrder } from '@/types/order.interface';
import { cn } from '@/lib/utils';
import { statusData } from '@/data/orders';
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

    const orders = !isLoading && data.data;
    const pagination = !isLoading && data.pagination;

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCurrentPage(1);
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
                                        'Pending',
                                        'Active',
                                        'In Revision',
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
                                'Working Status',
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
                            orders.map((order: IOrder, index: number) => {
                                const item = statusData.find(
                                    (item) => item.value === order.status
                                );

                                return (
                                    <TableRow
                                        key={index}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="text-center font-medium border-r">
                                            <Link
                                                href={`/orders/details/${order.orderID!}`}
                                                className={cn(
                                                    'text-primary underline',
                                                    order.orderStatus ===
                                                        'Canceled' &&
                                                        'text-destructive'
                                                )}
                                            >
                                                #{order.orderID}
                                            </Link>
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                'text-center text-sm border-r',
                                                order.orderStatus ===
                                                    'Canceled' &&
                                                    'text-destructive'
                                            )}
                                        >
                                            {order.userID}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                'text-start text-sm border-r',
                                                order.orderStatus ===
                                                    'Canceled' &&
                                                    'text-destructive'
                                            )}
                                        >
                                            <ul className="list-decimal list-inside space-y-1">
                                                {order.services.map(
                                                    (service) => (
                                                        <li key={service.name}>
                                                            {service.name}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                'text-center text-sm border-r',
                                                order.orderStatus ===
                                                    'Canceled' &&
                                                    'text-destructive'
                                            )}
                                        >
                                            ${order.total?.toFixed(2) || 0}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                'text-center text-sm border-r',
                                                order.orderStatus ===
                                                    'Canceled' &&
                                                    'text-destructive'
                                            )}
                                        >
                                            <OrderPaymentStatus
                                                paymentStatus={
                                                    order.paymentStatus
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-center text-sm border-r">
                                            <span
                                                className={cn(
                                                    'flex items-center justify-center gap-1',
                                                    item && item.text
                                                )}
                                            >
                                                {item ? (
                                                    <item.icon
                                                        size={16}
                                                        className={cn(
                                                            item.text
                                                        )}
                                                    />
                                                ) : null}
                                                {order.status}
                                            </span>
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                'text-center text-sm border-r',
                                                role === 'User' &&
                                                    order.orderStatus ===
                                                        'Canceled' &&
                                                    'text-destructive'
                                            )}
                                        >
                                            <SelectOrderStatus
                                                order={order}
                                                role={role}
                                                orderID={order.orderID!}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Link
                                                href={`/orders/details/${order.orderID!}`}
                                                className="flex items-center justify-center gap-1 group"
                                            >
                                                <EyeIcon size={20} />
                                                <span className="group-hover:underline cursor-pointer">
                                                    Details
                                                </span>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
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
