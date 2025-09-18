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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import {
    ChevronDown,
    ChevronUp,
    Search,
    Eye,
    FileText,
    EllipsisVertical,
    ArrowUpDown,
    Calendar,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useGetApplicantsQuery } from '@/redux/features/applicant/applicantApi';
import IApplicant from '@/types/applicant.interface';

export default function ApplicantsTable() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const { data, isLoading } = useGetApplicantsQuery({
        search,
        page,
        limit,
        filter: statusFilter,
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

    const statusTabs = [
        { value: 'all', label: 'All', count: data?.pagination?.total || 0 },
        {
            value: 'applied',
            label: 'Applied',
            count:
                data?.applicants.filter(
                    (a: IApplicant) => a.status === 'applied'
                ).length || 0,
        },
        {
            value: 'shortlisted',
            label: 'Shortlisted',
            count:
                data?.applicants.filter(
                    (a: IApplicant) => a.status === 'shortlisted'
                ).length || 0,
        },
        {
            value: 'interview',
            label: 'Interview',
            count:
                data?.applicants.filter(
                    (a: IApplicant) => a.status === 'shortlisted'
                ).length || 0,
        },
        {
            value: 'hired',
            label: 'Hired',
            count:
                data?.applicants.filter((a: IApplicant) => a.status === 'hired')
                    .length || 0,
        },
        {
            value: 'rejected',
            label: 'Rejected',
            count:
                data?.applicants.filter(
                    (a: IApplicant) => a.status === 'rejected'
                ).length || 0,
        },
    ];

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'applied':
                return 'bg-blue-100 text-blue-800';
            case 'shortlisted':
                return 'bg-purple-100 text-purple-800';
            case 'interview':
                return 'bg-yellow-100 text-yellow-800';
            case 'hired':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header with search and filters */}
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
                    <Select
                        value={sortBy}
                        onValueChange={(value) => {
                            setSortBy(value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center">
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                <span>Sort by</span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>Date Applied</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="firstName">
                                <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    <span>Name (A-Z)</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-1"
                            >
                                <span>Show: {limit}</span>
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

            {/* Status Tabs */}
            <Tabs
                value={statusFilter}
                onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                }}
                className="w-full"
            >
                <TabsList className="flex flex-wrap h-auto p-1 bg-muted/50">
                    {statusTabs.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex items-center gap-2 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                        >
                            <span>{tab.label}</span>
                            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-xs font-medium">
                                {tab.count}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={statusFilter} className="mt-6">
                    {/* Applicants Table */}
                    <div className="overflow-x-auto rounded-lg border bg-background">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead
                                        className="font-semibold cursor-pointer"
                                        onClick={() => handleSort('firstName')}
                                    >
                                        <div className="flex items-center">
                                            <span>Name</span>
                                            {sortBy === 'firstName' &&
                                                (sortOrder === 'asc' ? (
                                                    <ChevronUp className="h-4 w-4 ml-1" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 ml-1" />
                                                ))}
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Job Title
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Email
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Phone
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Status
                                    </TableHead>
                                    <TableHead
                                        className="font-semibold cursor-pointer"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        <div className="flex items-center">
                                            <span>Applied On</span>
                                            {sortBy === 'createdAt' &&
                                                (sortOrder === 'asc' ? (
                                                    <ChevronUp className="h-4 w-4 ml-1" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 ml-1" />
                                                ))}
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: limit }).map(
                                        (_, i) => (
                                            <TableRow key={`loading-${i}`}>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-20 mx-auto" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-8 w-8 ml-auto" />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                ) : data?.applicants?.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-8"
                                        >
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Search className="h-12 w-12 mb-4 opacity-30" />
                                                <p className="text-lg font-medium mb-1">
                                                    No applicants found
                                                </p>
                                                <p className="text-sm">
                                                    {statusFilter !== 'all'
                                                        ? `No applicants with status "${statusFilter}"`
                                                        : 'Try adjusting your search or filters'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.applicants?.map(
                                        (applicant: {
                                            _id: string;
                                            jobTitle: string;
                                            firstName: string;
                                            lastName: string;
                                            email: string;
                                            phone: string;
                                            createdAt: string;
                                            status: string;
                                            documentUrl: string;
                                        }) => (
                                            <TableRow
                                                key={applicant._id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium">
                                                    {applicant.firstName}{' '}
                                                    {applicant.lastName}
                                                </TableCell>
                                                <TableCell>
                                                    {applicant.jobTitle}
                                                </TableCell>
                                                <TableCell>
                                                    {applicant.email}
                                                </TableCell>
                                                <TableCell>
                                                    {applicant.phone}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusClass(
                                                            applicant.status
                                                        )}`}
                                                    >
                                                        {applicant.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {format(
                                                        new Date(
                                                            applicant.createdAt
                                                        ),
                                                        'MMM dd, yyyy'
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <EllipsisVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/jobs/applicants/details/${applicant._id}`}
                                                                    className="flex items-center cursor-pointer"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={
                                                                        applicant.documentUrl
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener"
                                                                    className="flex items-center cursor-pointer"
                                                                >
                                                                    <FileText className="h-4 w-4 mr-2" />
                                                                    View Resume
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {data && data.applicants.length > 0 && (
                        <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 text-sm text-muted-foreground sm:flex-row">
                            <div>
                                Showing{' '}
                                <span className="font-medium">
                                    {(page - 1) * limit + 1}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {Math.min(
                                        page * limit,
                                        data.pagination.total
                                    )}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">
                                    {data.pagination.total}
                                </span>{' '}
                                entries
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                    disabled={page === 1 || isLoading}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronUp className="w-4 h-4" />
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({
                                        length: Math.min(
                                            5,
                                            data.pagination.totalPages
                                        ),
                                    }).map((_, i) => {
                                        const pageNumber = i + 1;
                                        return (
                                            <Button
                                                key={pageNumber}
                                                variant={
                                                    page === pageNumber
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setPage(pageNumber)
                                                }
                                                className="h-8 w-8 p-0"
                                            >
                                                {pageNumber}
                                            </Button>
                                        );
                                    })}
                                    {data.pagination.totalPages > 5 && (
                                        <span className="px-2">...</span>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={
                                        page >= data.pagination.totalPages ||
                                        isLoading
                                    }
                                    className="flex items-center gap-1"
                                >
                                    Next
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
