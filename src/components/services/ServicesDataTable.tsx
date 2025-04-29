'use client';

import React, { useState } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Pencil,
    Trash2,
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
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';
import IService, { IComplexity } from '@/types/service.interface';

export default function ServicesDataTable() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [quantity, setQuantity] = useState(10);

    const { data, isLoading } = useGetServicesQuery({
        params: { page: currentPage, quantity, searchQuery },
    });

    console.log(data?.pagination);

    const services = data?.data || [];
    const pagination = data?.pagination || { totalItems: 0, totalPages: 1 };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleEdit = (serviceId: string) => {
        console.log(`Edit service with ID: ${serviceId}`);
    };

    const handleDelete = (serviceId: string) => {
        console.log(`Delete service with ID: ${serviceId}`);
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
                                Status
                            </TableHead>
                            <TableHead className="font-medium text-center w-20">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(quantity)
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
                                    <TableCell className='border-r'>
                                        <div className="flex flex-wrap gap-2">
                                            {service.complexities?.map(
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
                                                        {tier.price?.toFixed(2)}
                                                    </Badge>
                                                )
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center border-r">
                                        <Badge
                                            variant="outline"
                                            className="gap-1"
                                        >
                                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                            Active
                                        </Badge>
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
                                                        handleEdit(service._id!)
                                                    }
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />{' '}
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() =>
                                                        handleDelete(
                                                            service._id!
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
