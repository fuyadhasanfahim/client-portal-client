'use client';

import React, { useState } from 'react';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    ChevronDown,
    Search,
    Eye,
    FileText,
    EllipsisIcon,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useGetApplicantsQuery } from '@/redux/features/applicant/applicantApi';
import IApplicant from '@/types/applicant.interface';

export default function ApplicantsTable() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const { data, isLoading } = useGetApplicantsQuery({
        search,
        page,
        limit,
        filter: 'all',
        sort: sortBy,
        sortOrder,
    });

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (data && page < data?.pagination.totalPages) setPage(page + 1);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Search + Limit */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search applicants..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-8"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-1"
                            >
                                <span>Show:</span>
                                <span className="font-medium">{limit}</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {[10, 25, 50, 100].map((size) => (
                                <DropdownMenuItem
                                    key={size}
                                    onClick={() => {
                                        setLimit(size);
                                        setPage(1);
                                    }}
                                >
                                    {size}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Applicants Table */}
            <div className="overflow-x-auto rounded-lg border bg-background">
                <Table>
                    <TableHeader className="bg-accent text-primary-foreground">
                        <TableRow>
                            <TableHead className="font-semibold border-r text-center">
                                Name
                            </TableHead>
                            <TableHead className="font-semibold border-r text-center">
                                Email
                            </TableHead>
                            <TableHead className="font-semibold border-r text-center">
                                Phone
                            </TableHead>
                            <TableHead className="font-semibold border-r text-center">
                                Status
                            </TableHead>
                            <TableHead
                                className="font-semibold cursor-pointer border-r text-center"
                                onClick={() => handleSort('createdAt')}
                            >
                                Applied On{' '}
                                {sortBy === 'createdAt' &&
                                    (sortOrder === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead className="font-semibold text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: limit }).map((_, i) => (
                                <TableRow key={`loading-${i}`}>
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : data?.applicants?.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-8"
                                >
                                    <p className="text-gray-500">
                                        No applicants found
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.applicants?.map((applicant: IApplicant) => (
                                <TableRow
                                    key={applicant._id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="font-medium border-r">
                                        {applicant.firstName}{' '}
                                        {applicant.lastName}
                                    </TableCell>
                                    <TableCell className="border-r">
                                        {applicant.email}
                                    </TableCell>
                                    <TableCell className="border-r">
                                        {applicant.phone}
                                    </TableCell>
                                    <TableCell className="border-r capitalize text-center">
                                        {applicant.status}
                                    </TableCell>
                                    <TableCell className="border-r text-center">
                                        {format(
                                            new Date(applicant.createdAt),
                                            'PPP'
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant={'ghost'}
                                                    size={'icon'}
                                                >
                                                    <EllipsisIcon />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>
                                                    <Link
                                                        href={`/jobs/applicants/details/${applicant._id}`}
                                                        className="flex items-center justify-center gap-1 group"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span className="group-hover:underline">
                                                            Details
                                                        </span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Link
                                                        href={
                                                            applicant.documentUrl
                                                        }
                                                        target="_blank"
                                                        rel="noopener"
                                                        className="flex items-center justify-center gap-1 group"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        <span className="group-hover:underline">
                                                            Resume
                                                        </span>
                                                    </Link>
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

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-4 px-2 text-sm text-muted-foreground sm:flex-row">
                <div>
                    Showing{' '}
                    {data
                        ? `${(page - 1) * limit + 1} to ${Math.min(
                              page * limit,
                              data?.pagination.total
                          )}`
                        : '0'}{' '}
                    of {data?.pagination.total || 0} entries
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousPage}
                        disabled={page === 1 || isLoading}
                    >
                        <ChevronDown className="w-4 h-4 rotate-90" />
                    </Button>
                    <div className="flex items-center justify-center w-10 text-sm">
                        {page}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextPage}
                        disabled={
                            !data ||
                            page >= data?.pagination.totalPages ||
                            isLoading
                        }
                    >
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
