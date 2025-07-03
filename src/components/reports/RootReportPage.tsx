'use client';

import React, { useState, useMemo, useEffect } from 'react';
import getLoggedInUser from '@/utils/getLoggedInUser';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import {
    Calendar,
    DollarSign,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    LucideIcon,
} from 'lucide-react';
import { IOrder } from '@/types/order.interface';
import ApiError from '../shared/ApiError';
import toast from 'react-hot-toast';
import { Skeleton } from '../ui/skeleton';
import IPayment from '@/types/payment.interface';

export default function RootReportPage({ authToken }: { authToken: string }) {
    const user = getLoggedInUser();
    const { id: userID, role } = user ?? {};

    const [timeRange, setTimeRange] = useState('30');
    const [chartType, setChartType] = useState('line');
    const [isCompletedOrdersLoading, setIsCompletedOrdersLoading] =
        useState(true);
    const [completedOrders, setCompletedOrders] = useState(0);
    const [isPaymentLoading, setIsPaymentLoading] = useState(true);
    const [payments, setPayments] = useState({
        totalAmount: 0,
        revenueTrend: 0,
    });
    const [isPendingLoading, setIsPendingLoading] = useState(true);
    const [pending, setPending] = useState({ totalAmount: 0, revenueTrend: 0 });
    const [isPaymentToMonthLoading, setIsPaymentToMonthLoading] =
        useState(true);
    const [paymentToMonth, setPaymentToMonth] = useState({
        totalAmount: 0,
        revenueTrend: 0,
    });

    const currentMonth = new Date().toLocaleDateString('en-US', {
        month: 'long',
    });

    useEffect(() => {
        const fetchCompletedOrders = async () => {
            try {
                const response = await fetch(
                    `${
                        process.env.NEXT_PUBLIC_BACKEND_URL
                    }/api/orders/get-orders-by-status?status=Completed&userID=${userID!}&role=${role!}`,
                    {
                        headers: { Authorization: `Bearer ${authToken}` },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    setCompletedOrders(result.data.length);
                } else {
                    toast.error(
                        result.message || 'Failed to fetch completed orders'
                    );
                }
            } catch (error) {
                console.error('Error fetching completed orders:', error);
                ApiError(error);
            } finally {
                setIsCompletedOrdersLoading(false);
            }
        };

        fetchCompletedOrders();
    }, [authToken, userID, role]);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await fetch(
                    `${
                        process.env.NEXT_PUBLIC_BACKEND_URL
                    }/api/payments/get-payments-to-date-by-status?status=paid&paymentOption=Pay%20Now&userID=${userID!}&role=${role!}`,
                    {
                        headers: { Authorization: `Bearer ${authToken}` },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    setPayments(result.data);
                } else {
                    toast.error(result.message || 'Failed to fetch payments');
                }
            } catch (error) {
                console.error('Error fetching payments:', error);
                ApiError(error);
            } finally {
                setIsPaymentLoading(false);
            }
        };

        fetchPayments();
    }, [authToken, userID, role]);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const response = await fetch(
                    `${
                        process.env.NEXT_PUBLIC_BACKEND_URL
                    }/api/payments/get-payments-to-date-by-status?status=paid&paymentOption=Pay Later&userID=${userID!}&role=${role!}`,
                    {
                        headers: { Authorization: `Bearer ${authToken}` },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    setPending(result.data);
                } else {
                    toast.error(
                        result.message || 'Failed to fetch pending payments'
                    );
                }
            } catch (error) {
                console.error('Error fetching pending payments:', error);
                ApiError(error);
            } finally {
                setIsPendingLoading(false);
            }
        };

        fetchPending();
    }, [authToken, userID, role]);

    useEffect(() => {
        const fetchPaymentToMonth = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/get-payments-to-date-by-status?status=paid&paymentOption=Pay%20Now&month=${currentMonth}&userID=${userID}&role=${role}`,
                    {
                        headers: { Authorization: `Bearer ${authToken}` },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    setPaymentToMonth(result.data);
                } else {
                    toast.error(
                        result.message || 'Failed to fetch monthly payments'
                    );
                }
            } catch (error) {
                ApiError(error);
            } finally {
                setIsPaymentToMonthLoading(false);
            }
        };

        fetchPaymentToMonth();
    }, [authToken, userID, role, currentMonth]);

    const StatCard = ({
        title,
        value,
        icon,
        trend,
        prefix,
        suffix,
        loading,
    }: {
        title: string;
        value: string | number;
        icon: any;
        trend?: number;
        prefix?: string;
        suffix?: string;
        loading?: boolean;
    }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-medium">{title}</CardTitle>
                {icon &&
                    React.createElement(icon, {
                        className: 'h-4 w-4 text-primary',
                    })}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-32 mb-2" />
                ) : (
                    <div className="text-2xl font-bold">
                        {prefix}
                        {typeof value === 'number'
                            ? value.toLocaleString()
                            : value}
                        {suffix}
                    </div>
                )}

                {loading ? (
                    <Skeleton className="h-4 w-40 rounded-md" />
                ) : trend !== undefined ? (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {trend > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span
                            className={
                                trend > 0 ? 'text-green-500' : 'text-red-500'
                            }
                        >
                            {Math.abs(trend).toFixed(1)}%
                        </span>
                        <span className="ml-1">from last period</span>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Orders Report
                    </h1>
                    <p className="text-muted-foreground">
                        Track your sales performance and order metrics
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">7 Days</SelectItem>
                            <SelectItem value="30">30 Days</SelectItem>
                            <SelectItem value="90">3 Months</SelectItem>
                            <SelectItem value="365">1 Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={
                        role === 'User' ? 'Expense to Date' : 'Earnings to Date'
                    }
                    value={payments.totalAmount}
                    icon={DollarSign}
                    prefix="$"
                    loading={isPaymentLoading}
                    trend={payments.revenueTrend}
                />
                <StatCard
                    title="Pending to Date"
                    value={pending.totalAmount}
                    icon={DollarSign}
                    prefix="$"
                    loading={isPendingLoading}
                    trend={pending.revenueTrend}
                />
                <StatCard
                    title="Orders Completed"
                    value={completedOrders}
                    icon={CheckCircle}
                    loading={isCompletedOrdersLoading}
                />
                <StatCard
                    title={
                        role === 'User'
                            ? `Expense in ${currentMonth}`
                            : `Earnings in ${currentMonth}`
                    }
                    value={paymentToMonth.totalAmount}
                    icon={Calendar}
                    prefix="$"
                    loading={isPaymentToMonthLoading}
                    trend={paymentToMonth.revenueTrend}
                />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Overview</CardTitle>
                            <CardDescription>
                                Sales performance over the last {timeRange} days
                            </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select
                                value={chartType}
                                onValueChange={setChartType}
                            >
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="line">Line</SelectItem>
                                    <SelectItem value="bar">Bar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="revenue" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="revenue">Revenue</TabsTrigger>
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="price">
                                Price Trends
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="revenue" className="space-y-4">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartType === 'line' ? (
                                        <LineChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="dateFormatted"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    `$${value}`,
                                                    name,
                                                ]}
                                                labelFormatter={(label) =>
                                                    `Date: ${label}`
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                name="Revenue"
                                            />
                                        </LineChart>
                                    ) : (
                                        <BarChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="dateFormatted"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    `$${value}`,
                                                    name,
                                                ]}
                                                labelFormatter={(label) =>
                                                    `Date: ${label}`
                                                }
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="revenue"
                                                fill="#8884d8"
                                                name="Revenue"
                                            />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>

                        <TabsContent value="orders" className="space-y-4">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartType === 'line' ? (
                                        <LineChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="dateFormatted"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="newOrders"
                                                stroke="#82ca9d"
                                                strokeWidth={2}
                                                name="New Orders"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="completedOrders"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                name="Completed Orders"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="canceledOrders"
                                                stroke="#ff7c7c"
                                                strokeWidth={2}
                                                name="Canceled Orders"
                                            />
                                        </LineChart>
                                    ) : (
                                        <BarChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="dateFormatted"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="newOrders"
                                                fill="#82ca9d"
                                                name="New Orders"
                                            />
                                            <Bar
                                                dataKey="completedOrders"
                                                fill="#8884d8"
                                                name="Completed Orders"
                                            />
                                            <Bar
                                                dataKey="canceledOrders"
                                                fill="#ff7c7c"
                                                name="Canceled Orders"
                                            />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>

                        <TabsContent value="price" className="space-y-4">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartType === 'line' ? (
                                        <LineChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="dateFormatted"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    `$${value}`,
                                                    name,
                                                ]}
                                                labelFormatter={(label) =>
                                                    `Date: ${label}`
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="salesPrice"
                                                stroke="#ffc658"
                                                strokeWidth={2}
                                                name="Sales Price"
                                            />
                                        </LineChart>
                                    ) : (
                                        <BarChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="dateFormatted"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    `$${value}`,
                                                    name,
                                                ]}
                                                labelFormatter={(label) =>
                                                    `Date: ${label}`
                                                }
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="salesPrice"
                                                fill="#ffc658"
                                                name="Sales Price"
                                            />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

{
    /* <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Summary Statistics</CardTitle>
                        <CardDescription>
                            Key metrics for the selected period
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                                Total Orders:
                            </span>
                            <Badge variant="secondary">
                                {data.reduce(
                                    (sum, item) => sum + item.newOrders,
                                    0
                                )}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                                Completion Rate:
                            </span>
                            <Badge variant="secondary">
                                {(
                                    (stats.totalCompleted /
                                        data.reduce(
                                            (sum, item) => sum + item.newOrders,
                                            0
                                        )) *
                                    100
                                ).toFixed(1)}
                                %
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                                Total Canceled:
                            </span>
                            <Badge variant="destructive">
                                {data.reduce(
                                    (sum, item) => sum + item.canceledOrders,
                                    0
                                )}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                                Daily Avg Revenue:
                            </span>
                            <Badge variant="secondary">
                                ${(stats.totalRevenue / data.length).toFixed(2)}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Insights</CardTitle>
                        <CardDescription>
                            Analysis of your sales trends
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2">
                            {stats.revenueTrend > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">
                                Revenue is{' '}
                                {stats.revenueTrend > 0
                                    ? 'trending up'
                                    : 'trending down'}{' '}
                                by{' '}
                                <span
                                    className={
                                        stats.revenueTrend > 0
                                            ? 'text-green-500'
                                            : 'text-red-500'
                                    }
                                >
                                    {Math.abs(stats.revenueTrend).toFixed(1)}%
                                </span>
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Compared to the previous period of the same duration
                        </div>
                    </CardContent>
                </Card>
            </div> */
}
