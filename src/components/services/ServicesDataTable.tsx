'use client';

import React, { useEffect, useState } from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Search,
    Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import IService, { IComplexity } from '@/types/service.interface';
import axiosInstance from '@/lib/axios-instance';
import ApiError from '../shared/ApiError';

export const columns: ColumnDef<IService>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
                className="hover:bg-transparent"
            >
                Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('name')}</div>
        ),
    },
    {
        accessorKey: 'complexities',
        header: 'Pricing Tiers',
        cell: ({ row }) => {
            const complexities = row.getValue('complexities') as IComplexity[];
            return (
                <div className="flex flex-wrap gap-2">
                    {complexities.map((c) => (
                        <Badge
                            key={c.label}
                            variant="outline"
                            className="bg-slate-50 dark:bg-slate-800"
                        >
                            <span className="font-medium">{c.label}:</span> $
                            {c.price.toFixed(2)}
                        </Badge>
                    ))}
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <Settings className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit details</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function ServicesDataTable() {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<IService[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [rowSelection, setRowSelection] = useState({});

    const fetchServices = async (
        page = currentPage,
        quantity = pageSize,
        query = searchQuery
    ) => {
        setLoading(true);

        try {
            const response = await axiosInstance.get(
                `/services/get-all-services`,
                { params: { page, quantity, searchQuery: query } }
            );

            if (response.status === 200) {
                setData(response.data.data);
                setTotalItems(response.data.pagination?.totalItems || 0);
                setTotalPages(response.data.pagination?.totalPages || 1);
                setCurrentPage(response.data.pagination?.page || 1);
                setPageSize(response.data.pagination?.quantity || 10);
            }
        } catch (error) {
            ApiError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchServices(page, pageSize, searchQuery);
    };

    const handlePageSizeChange = (size: string) => {
        const newSize = parseInt(size);
        setPageSize(newSize);
        setCurrentPage(1);
        fetchServices(1, newSize, searchQuery);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchServices(1, pageSize, searchQuery);
    };

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const renderPaginationButtons = () => {
        const buttons = [];
        const maxButtonsToShow = 5;
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxButtonsToShow / 2)
        );
        const endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

        if (endPage - startPage + 1 < maxButtonsToShow) {
            startPage = Math.max(1, endPage - maxButtonsToShow + 1);
        }

        if (startPage > 1) {
            buttons.push(
                <Button
                    key="first"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(1)}
                >
                    1
                </Button>
            );
            if (startPage > 2) {
                buttons.push(
                    <span key="ellipsis1" className="mx-2">
                        ...
                    </span>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <Button
                    key={i}
                    variant={i === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(
                    <span key="ellipsis2" className="mx-2">
                        ...
                    </span>
                );
            }
            buttons.push(
                <Button
                    key="last"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </Button>
            );
        }

        return buttons;
    };

    const renderTableContent = () => {
        if (loading) {
            return Array(pageSize)
                .fill(0)
                .map((_, index) => (
                    <TableRow key={index}>
                        {Array(columns.length)
                            .fill(0)
                            .map((_, colIndex) => (
                                <TableCell key={colIndex} className="py-3">
                                    <Skeleton className="h-8 w-full" />
                                </TableCell>
                            ))}
                    </TableRow>
                ));
        }

        if (!data.length) {
            return (
                <TableRow>
                    <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                    >
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <Search className="h-8 w-8 text-gray-400" />
                            <p className="text-gray-500">No services found</p>
                        </div>
                    </TableCell>
                </TableRow>
            );
        }

        return table.getRowModel().rows.map((row) => (
            <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                    </TableCell>
                ))}
            </TableRow>
        ));
    };

    return (
        <Card className="w-full shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle>Services Catalog</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 space-y-2 sm:space-y-0">
                    <form
                        onSubmit={handleSearch}
                        className="w-full sm:w-auto flex space-x-2"
                    >
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Show:</span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={handlePageSizeChange}
                        >
                            <SelectTrigger className="w-16 h-8">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="border-t">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow
                                    key={headerGroup.id}
                                    className="hover:bg-transparent"
                                >
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="bg-slate-50 dark:bg-slate-800"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>{renderTableContent()}</TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t px-4 py-3">
                <div className="flex-1 text-sm text-gray-500">
                    {table.getFilteredSelectedRowModel().rows.length > 0 && (
                        <span>
                            {table.getFilteredSelectedRowModel().rows.length} of{' '}
                            {totalItems} selected
                        </span>
                    )}
                    {!table.getFilteredSelectedRowModel().rows.length && (
                        <span>
                            Showing{' '}
                            {Math.min(
                                (currentPage - 1) * pageSize + 1,
                                totalItems
                            )}{' '}
                            to {Math.min(currentPage * pageSize, totalItems)} of{' '}
                            {totalItems} entries
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center space-x-1">
                        {renderPaginationButtons()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
