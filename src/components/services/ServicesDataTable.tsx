'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Pencil,
    Trash2,
    CircleDashed,
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
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    useDeleteServiceMutation,
    useGetServicesQuery,
    useUpdateServiceStatusMutation,
} from '@/redux/features/services/servicesApi';
import IService, { IComplexity } from '@/types/service.interface';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ApiError from '../shared/ApiError';
import { useRouter } from 'next/navigation';

export default function ServicesDataTable() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [quantity, setQuantity] = useState(10);
    const router = useRouter();

    const { data, isLoading } = useGetServicesQuery({
        params: { page: currentPage, quantity, searchQuery },
    });

    const [deleteService, { isLoading: isDeleting }] =
        useDeleteServiceMutation();

    const [updateServiceStatus, { isLoading: isStatusUpdating }] =
        useUpdateServiceStatusMutation();

    const services = data?.data || [];
    const pagination = data?.pagination || { totalItems: 0, totalPages: 1 };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteService(id).unwrap();
            toast.success('Service deleted successfully');
        } catch (error) {
            ApiError(error);
        }
    };

    const handleUpdateStatus = async ({
        id,
        status,
    }: {
        id: string;
        status: string;
    }) => {
        try {
            await updateServiceStatus({ id, status }).unwrap();
            toast.success('Successfully updated the status.');
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <Card className="w-full p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <form onSubmit={handleSearch} className="w-full">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </form>

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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-medium text-center border-r">
                                Name
                            </TableHead>
                            <TableHead className="font-medium text-center border-r">
                                Pricing Tiers
                            </TableHead>
                            <TableHead className="font-medium text-center border-r">
                                Accessible To
                            </TableHead>
                            <TableHead className="font-medium text-center border-r">
                                Status
                            </TableHead>
                            <TableHead className="font-medium text-center w-20">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(5)
                                .fill(0)
                                .map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        <TableCell>
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Skeleton className="h-6 w-16 mx-auto" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Skeleton className="h-6 w-16 mx-auto" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Skeleton className="h-6 w-6 mx-auto rounded-full" />
                                        </TableCell>
                                    </TableRow>
                                ))
                        ) : services.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
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
                            services.map((service: IService, index: number) => (
                                <TableRow
                                    key={index}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <TableCell className="font-medium border-r">
                                        {service.name}
                                    </TableCell>
                                    <TableCell className="border-r">
                                        <div className="flex flex-wrap gap-2">
                                            {(service.complexities ?? [])
                                                .length > 0 ? (
                                                service.complexities?.map(
                                                    (tier: IComplexity) => (
                                                        <Badge
                                                            key={tier.label}
                                                            variant="outline"
                                                            className="bg-slate-50"
                                                        >
                                                            <span className="font-medium">
                                                                {tier.label}:
                                                            </span>{' '}
                                                            $
                                                            {tier.price?.toFixed(
                                                                2
                                                            )}
                                                        </Badge>
                                                    )
                                                )
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-slate-50"
                                                >
                                                    ${service.price?.toFixed(2)}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium border-r text-center">
                                        {service.accessibleTo === 'All' ? (
                                            service.accessibleTo
                                        ) : (
                                            <span>
                                                {service.accessibleTo}:{' '}
                                                {service.accessList?.length}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="flex items-center justify-center border-r">
                                        <Select
                                            value={service.status}
                                            onValueChange={(newStatus) =>
                                                handleUpdateStatus({
                                                    id: service._id!,
                                                    status: newStatus,
                                                })
                                            }
                                            disabled={isStatusUpdating}
                                        >
                                            <SelectTrigger className="border-none shadow-none">
                                                <Badge
                                                    variant="outline"
                                                    className="gap-1"
                                                >
                                                    <CircleDashed
                                                        size={16}
                                                        className={cn(
                                                            service.status ===
                                                                'Active'
                                                                ? 'text-primary'
                                                                : service.status ===
                                                                  'Pending'
                                                                ? 'text-yellow-500'
                                                                : 'text-destructive'
                                                        )}
                                                    />
                                                    {service.status}
                                                </Badge>
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="Active">
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1"
                                                    >
                                                        <CircleDashed
                                                            size={16}
                                                            className="text-primary"
                                                        />
                                                        Active
                                                    </Badge>
                                                </SelectItem>
                                                <SelectItem value="Pending">
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1"
                                                    >
                                                        <CircleDashed
                                                            size={16}
                                                            className="text-yellow-500"
                                                        />
                                                        Pending
                                                    </Badge>
                                                </SelectItem>
                                                <SelectItem value="Inactive">
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1"
                                                    >
                                                        <CircleDashed className="text-destructive" />
                                                        Inactive
                                                    </Badge>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <span className="sr-only">
                                                        Open menu
                                                    </span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        router.push(
                                                            `/services/update/${service._id!}`
                                                        )
                                                    }
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />{' '}
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    disabled={isDeleting}
                                                    onClick={() =>
                                                        handleDelete(
                                                            service._id as string
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />{' '}
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing{' '}
                    {pagination.totalItems > 0
                        ? `${currentPage - 1 + 1} to ${Math.min(
                              currentPage * quantity,
                              pagination.totalItems
                          )}`
                        : '0'}{' '}
                    of {pagination.totalItems} entries
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
        </Card>
    );
}
