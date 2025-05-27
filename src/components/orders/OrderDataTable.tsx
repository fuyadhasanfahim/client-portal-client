'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Ellipsis,
    Trash2,
    EyeIcon,
    Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useRouter } from 'next/navigation';
import {
    useGetOrdersQuery,
    useUpdateOrderMutation,
} from '@/redux/features/orders/ordersApi';
import { IOrder } from '@/types/order.interface';
import { Badge } from '../ui/badge';
import toast from 'react-hot-toast';
import ApiError from '../shared/ApiError';
import {
    IconCancel,
    IconGitPullRequest,
    IconInfoCircle,
    IconLoader,
    IconProgress,
    IconProgressCheck,
} from '@tabler/icons-react';
import SelectStatus from '../shared/SelectStatus';

const statusData = [
    {
        id: 'pending',
        title: 'Pending',
        value: 'pending',
        icon: IconLoader,
    },
    {
        id: 'in-progress',
        title: 'In Progress',
        value: 'in-progress',
        icon: IconProgress,
    },
    {
        id: 'client-review',
        title: 'Client Review',
        value: 'client-review',
        icon: IconInfoCircle,
    },
    {
        id: 'revision-requested',
        title: 'Revision Requested',
        value: 'revision-requested',
        icon: IconGitPullRequest,
    },
    {
        id: 'completed',
        title: 'Completed',
        value: 'completed',
        icon: IconProgressCheck,
    },
    {
        id: 'cancelled',
        title: 'Cancelled',
        value: 'cancelled',
        icon: IconCancel,
    },
];

export default function OrderDataTable({ role }: { role: string }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [quantity, setQuantity] = useState(10);
    const router = useRouter();

    const { data, isLoading } = useGetOrdersQuery({
        params: { page: currentPage, quantity, searchQuery },
    });
    const [updateOrder, { isLoading: isStatusUpdating }] =
        useUpdateOrderMutation();

    const orders = !isLoading && data.data;
    const pagination = !isLoading && data.pagination;

    const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
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
            const response = await updateOrder({
                id,
                data: { status: data.status },
            }).unwrap();

            if (response.success) {
                toast.success('Order status updated successfully');
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <form onSubmit={handleSearch} className="w-full">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </form>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort:</span>
                    <Select
                        value={quantity.toString()}
                        onValueChange={(value) => setQuantity(Number(value))}
                    >
                        <SelectTrigger className="w-20 h-9">
                            <SelectValue placeholder={quantity} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">Completed</SelectItem>
                            <SelectItem value="25">Pending</SelectItem>
                            <SelectItem value="50">In-Progress</SelectItem>
                            <SelectItem value="100">Canceled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Show:</span>
                    <Select
                        value={quantity.toString()}
                        onValueChange={(value) => setQuantity(Number(value))}
                    >
                        <SelectTrigger className="w-20 h-9">
                            <SelectValue placeholder={quantity} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border overflow-hidden">
                <Table className="overflow-x-auto">
                    <TableHeader className="bg-accent">
                        <TableRow>
                            <TableHead className="text-center border-r">
                                Order ID
                            </TableHead>
                            <TableHead className="text-center border-r">
                                Client
                            </TableHead>
                            <TableHead className="text-center border-r">
                                Services
                            </TableHead>
                            <TableHead className="text-center border-r">
                                Total ($)
                            </TableHead>
                            <TableHead className="text-center border-r">
                                Payment Status ($)
                            </TableHead>
                            <TableHead className="text-center border-r">
                                Status
                            </TableHead>
                            {role !== 'User' && (
                                <TableHead className="text-center border-r">
                                    Order Status
                                </TableHead>
                            )}
                            <TableHead className="text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array(8)
                                .fill(0)
                                .map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        {Array(8)
                                            .fill(0)
                                            .map((_, i) => (
                                                <TableCell
                                                    key={i}
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
                                    className="h-24 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Search className="h-8 w-8 text-gray-400" />
                                        <p className="text-gray-500">
                                            No services found
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order: IOrder, index: number) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell className="text-center font-medium border-r">
                                            #{order._id}
                                        </TableCell>
                                        <TableCell className="text-center text-sm border-r">
                                            {order.userId}
                                        </TableCell>
                                        <TableCell className="text-start text-sm border-r">
                                            <ul className="space-y-1">
                                                {order.services.map((s, i) => (
                                                    <li
                                                        key={i}
                                                        className="list-inside"
                                                    >
                                                        <div>
                                                            <span className="font-medium">
                                                                {s.name}
                                                            </span>
                                                            {s.complexity && (
                                                                <span className="text-gray-500">
                                                                    {' '}
                                                                    →{' '}
                                                                    {
                                                                        s
                                                                            .complexity
                                                                            .name
                                                                    }
                                                                </span>
                                                            )}
                                                            {(s.types ?? [])
                                                                .length > 0 && (
                                                                <ul className="ml-4 list-[circle] text-gray-600 text-xs">
                                                                    {s.types?.map(
                                                                        (
                                                                            t,
                                                                            j
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    j
                                                                                }
                                                                            >
                                                                                {
                                                                                    t.name
                                                                                }
                                                                                {t.complexity &&
                                                                                    ` (${t.complexity.name}`}
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                        <TableCell className="text-center border-r">
                                            ${order.total?.toFixed(2) || 0}
                                        </TableCell>
                                        <TableCell className="text-center border-r">
                                            <Badge
                                                variant="outline"
                                                className={`capitalize ${
                                                    order.paymentStatus ===
                                                    'paid'
                                                        ? 'text-green-700 border-green-300 bg-green-50'
                                                        : order.paymentStatus ===
                                                          'refunded'
                                                        ? 'text-blue-500 border-blue-500 bg-blue-50'
                                                        : 'text-orange-500 border-orange-500 bg-orange-50'
                                                }`}
                                            >
                                                {order.paymentStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center border-r">
                                            <SelectStatus
                                                data={statusData}
                                                handleUpdateStatus={
                                                    handleStatusChange
                                                }
                                                id={order._id!}
                                                status={order.status}
                                                isStatusUpdating={
                                                    isStatusUpdating
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-center border-r">
                                            <SelectStatus
                                                data={statusData}
                                                handleUpdateStatus={
                                                    handleStatusChange
                                                }
                                                id={order._id!}
                                                status={order.status}
                                                isStatusUpdating={
                                                    isStatusUpdating
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant={'ghost'}
                                                        size={'icon'}
                                                    >
                                                        <Ellipsis />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {order.status ===
                                                    'draft' ? (
                                                        <DropdownMenuItem>
                                                            <Edit2 />
                                                            Continue Editing
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                router.push(
                                                                    `/orders/details?id=${order._id!}`
                                                                )
                                                            }
                                                        >
                                                            <EyeIcon />
                                                            Details
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem variant="destructive">
                                                        <Trash2 />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing{' '}
                    {pagination.total > 0
                        ? `${currentPage - 1 + 1} to ${Math.min(
                              currentPage * quantity,
                              pagination.total
                          )}`
                        : '0'}{' '}
                    of {pagination.total} entries
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={
                            currentPage === pagination.totalPages || isLoading
                        }
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
