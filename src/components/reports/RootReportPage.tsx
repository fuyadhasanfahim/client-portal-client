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
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    Calendar,
    DollarSign,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    LucideIcon,
} from 'lucide-react';
import ApiError from '../shared/ApiError';
import toast from 'react-hot-toast';
import { Skeleton } from '../ui/skeleton';
import { format, subDays, subMonths } from 'date-fns';
import { IOrder } from '@/types/order.interface';

export default function RootReportPage({ authToken }: { authToken: string }) {
    const user = getLoggedInUser();
    const { id: userID, role } = user ?? {};

    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [orders, setOrders] = useState([]);
    const [chartDateRange, setChartDateRange] = useState('30');
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

    const transformOrdersToChartData = (orders: IOrder[], range: string) => {
        const now = new Date();
        const startDate =
            range === '15'
                ? subDays(now, 15)
                : range === '30'
                ? subDays(now, 30)
                : range === '365'
                ? subMonths(now, 12)
                : subDays(now, 30);

        if (range === '365') {
            const monthlyData: Record<
                string,
                {
                    date: Date;
                    newOrders: number;
                    completedOrders: number;
                    canceledOrders: number;
                    monthKey: string;
                }
            > = {};

            const date = new Date(startDate);
            while (date <= now) {
                const monthKey = format(date, 'yyyy-MM');
                monthlyData[monthKey] = {
                    date: new Date(date),
                    newOrders: 0,
                    completedOrders: 0,
                    canceledOrders: 0,
                    monthKey,
                };
                date.setMonth(date.getMonth() + 1);
            }

            orders.forEach((order) => {
                const orderDate = new Date(order.createdAt ?? '');
                if (orderDate < startDate) return;

                const monthKey = format(orderDate, 'yyyy-MM');
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        date: orderDate,
                        newOrders: 0,
                        completedOrders: 0,
                        canceledOrders: 0,
                        monthKey,
                    };
                }

                if (order.status === 'Completed') {
                    monthlyData[monthKey].completedOrders += 1;
                } else if (order.status === 'Canceled') {
                    monthlyData[monthKey].canceledOrders += 1;
                }
                monthlyData[monthKey].newOrders += 1;
            });

            return Object.values(monthlyData)
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((item) => ({
                    ...item,
                    dateFormatted: format(item.date, 'MMM yyyy'),
                }));
        } else {
            const dailyData: Record<
                string,
                {
                    date: Date;
                    newOrders: number;
                    completedOrders: number;
                    canceledOrders: number;
                }
            > = {};

            const date = new Date(startDate);
            while (date <= now) {
                const dateKey = date.toISOString().split('T')[0];
                dailyData[dateKey] = {
                    date: new Date(date),
                    newOrders: 0,
                    completedOrders: 0,
                    canceledOrders: 0,
                };
                date.setDate(date.getDate() + 1);
            }

            orders.forEach((order) => {
                const orderDate = new Date(order.createdAt ?? '');
                if (orderDate < startDate) return;

                const dateKey = orderDate.toISOString().split('T')[0];
                if (!dailyData[dateKey]) {
                    dailyData[dateKey] = {
                        date: orderDate,
                        newOrders: 0,
                        completedOrders: 0,
                        canceledOrders: 0,
                    };
                }

                if (order.status === 'Completed') {
                    dailyData[dateKey].completedOrders += 1;
                } else if (order.status === 'Canceled') {
                    dailyData[dateKey].canceledOrders += 1;
                }
                dailyData[dateKey].newOrders += 1;
            });

            return Object.values(dailyData)
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((item) => ({
                    ...item,
                    dateFormatted: format(item.date, 'MMM dd'),
                }));
        }
    };

    const chartData = useMemo(() => {
        return transformOrdersToChartData(orders, chartDateRange);
    }, [orders, chartDateRange]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(
                    `${
                        process.env.NEXT_PUBLIC_BACKEND_URL
                    }/api/orders/get-orders-for-report-page?userID=${userID!}&role=${role!}`,
                    {
                        headers: { Authorization: `Bearer ${authToken}` },
                    }
                );

                const result = await response.json();

                if (result.success) {
                    setOrders(result.data);
                } else {
                    toast.error(
                        result.message || 'Failed to fetch completed orders'
                    );
                }
            } catch (error) {
                ApiError(error);
            } finally {
                setIsLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [authToken, userID, role]);

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

                const result = await response.json();

                if (result.success) {
                    setCompletedOrders(result.data.length);
                } else {
                    toast.error(
                        result.message || 'Failed to fetch completed orders'
                    );
                }
            } catch (error) {
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

                const result = await response.json();

                if (result.success) {
                    setPayments(result.data);
                } else {
                    toast.error(result.message || 'Failed to fetch payments');
                }
            } catch (error) {
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

                const result = await response.json();

                if (result.success) {
                    setPending(result.data);
                } else {
                    toast.error(
                        result.message || 'Failed to fetch pending payments'
                    );
                }
            } catch (error) {
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
        icon: LucideIcon;
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Orders Report
                </h1>
                <p className="text-muted-foreground">
                    Track your sales performance and order metrics
                </p>
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
                                Sales performance over the last{' '}
                                {chartDateRange === '15'
                                    ? '15 days'
                                    : chartDateRange === '30'
                                    ? '30 days'
                                    : chartDateRange === '365'
                                    ? '1 year'
                                    : '30 days'}
                            </CardDescription>
                        </div>
                        <Select
                            value={chartDateRange}
                            onValueChange={setChartDateRange}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15">15 Days</SelectItem>
                                <SelectItem value="30">1 Month</SelectItem>
                                <SelectItem value="365">1 Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingOrders ? (
                        <Skeleton className="h-80 w-full" />
                    ) : (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                {
                                    <LineChart data={chartData}>
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
                                }
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
