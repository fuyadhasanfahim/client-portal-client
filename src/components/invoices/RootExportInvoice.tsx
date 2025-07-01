'use client';

import getLoggedInUser from '@/utils/getLoggedInUser';
import { useEffect, useState } from 'react';
import ApiError from '../shared/ApiError';
import { IOrder } from '@/types/order.interface';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '../ui/card';
import { Calendar } from '../ui/calendar';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { format } from 'date-fns';
import { Download, FileSearch, Send } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import IUser from '@/types/user.interface';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';

export default function RootExportInvoice({
    authToken,
}: {
    authToken: string;
}) {
    const user = getLoggedInUser();
    const { id: userID, role } = user ?? {};

    const [isLoading, setIsLoading] = useState(false);
    const [isPdfDownloading, setPdfDownloading] = useState(false);
    const [orders, setOrders] = useState<IOrder[] | []>([]);
    const [client, setClient] = useState<IUser | undefined>(undefined);
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to?: Date | undefined;
    }>({ from: undefined, to: undefined });
    const [filteredOrders, setFilteredOrders] = useState<IOrder[]>([]);
    const [selectedOrderIDs, setSelectedOrderIDs] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/get-all-orders-by-user-id?userID=${userID}&role=${role}`,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                const result = await response.json();

                if (result.success) {
                    setOrders(result.data);
                }
            } catch (error) {
                ApiError(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userID && role) {
            fetchOrders();
        }
    }, [userID, role, authToken]);

    useEffect(() => {
        const fetchClient = async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/get-user-by-id?user_id=${orders[0]?.userID}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const data = await res.json();

            if (res.ok) {
                setClient(data.data);
            }
        };
        fetchClient();
    }, [orders, authToken]);

    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            const adjustedEndDate = new Date(dateRange.to);
            adjustedEndDate.setHours(23, 59, 59, 999);

            const filtered = orders.filter((order) => {
                if (!order.createdAt) return false;
                const createdAt = new Date(order.createdAt);
                return (
                    dateRange.from !== undefined &&
                    createdAt >= dateRange.from &&
                    createdAt <= adjustedEndDate
                );
            });
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders([]);
        }
        setSelectedOrderIDs([]);
        setSelectAll(false);
    }, [dateRange, orders]);

    const toggleSelect = (id: string) => {
        setSelectedOrderIDs((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const getSelectedOrders = () =>
        filteredOrders.filter((o) => selectedOrderIDs.includes(o.orderID!));

    const taxRate = 0.08;

    const handleInvoice = async () => {
        try {
            const selectedOrders = getSelectedOrders();
            if (isLoading) {
                return;
            }

            if (!client || selectedOrders.length === 0) {
                toast.error(
                    'Please select orders and ensure client data is available'
                );
                return;
            }

            const uniqueClients = new Set(selectedOrders.map((o) => o.userID));
            if (uniqueClients.size > 1) {
                toast.error(
                    'All selected orders must belong to the same client'
                );
                return;
            }

            setPdfDownloading(true);

            const subTotal = selectedOrders.reduce(
                (sum, order) => sum + (order.total ?? 0),
                0
            );
            const total = subTotal + subTotal * taxRate;

            const invoiceID = nanoid(6).toUpperCase();

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/new-invoice`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        invoiceID,
                        client: {
                            name: client.name,
                            phone: client.phone || 'N/A',
                            address: client.address || 'N/A',
                        },
                        company: {
                            name: 'Web Briks LLC',
                            address:
                                'Web briks, LLC. 1209, Mountain Road PL NE, STE R, ALBUQUERQUE, NM, 87110, US.',
                            phone: '+1 718 577 1232',
                        },
                        orders: selectedOrders,
                        date: {
                            ...dateRange,
                            issued: new Date(),
                        },
                        taxRate,
                        subTotal,
                        total,
                        createdBy: userID,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 'Failed to create invoice'
                );
            }

            const result = await response.json();

            if (!result.data?.invoiceID) {
                throw new Error('Invoice ID not returned from server');
            }

            toast.success('Successfully saved to database. Redirecting...');
            router.push(`/invoices/export-invoice/${result.data.invoiceID}`);
        } catch (error) {
            ApiError(error);
        } finally {
            setPdfDownloading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Export Invoices</CardTitle>
                <CardDescription>
                    Select orders to export as PDF
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0">
                    <div className="p-4 border-r">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-sm mb-2">
                                    Date Range
                                </h3>
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={(range) =>
                                        setDateRange(
                                            range ?? {
                                                from: undefined,
                                                to: undefined,
                                            }
                                        )
                                    }
                                    numberOfMonths={1}
                                    className="rounded-md w-full"
                                    fromDate={new Date(2020, 0, 1)}
                                    toDate={new Date()}
                                />
                                {dateRange.from && dateRange.to && (
                                    <Badge variant="outline" className="mt-2">
                                        {format(dateRange.from, 'MMM dd')} -{' '}
                                        {format(dateRange.to, 'MMM dd')}
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-medium text-sm mb-2">
                                    Selected
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedOrderIDs.length} orders
                                    </span>
                                    {selectedOrderIDs.length > 0 && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-6 text-destructive"
                                            onClick={() => {
                                                setSelectedOrderIDs([]);
                                                setSelectAll(false);
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="h-[500px]">
                        <div className="p-4">
                            {filteredOrders.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectAll}
                                                onCheckedChange={(checked) => {
                                                    setSelectAll(!!checked);
                                                    if (checked) {
                                                        setSelectedOrderIDs(
                                                            filteredOrders.map(
                                                                (order) =>
                                                                    order.orderID!
                                                            )
                                                        );
                                                    } else {
                                                        setSelectedOrderIDs([]);
                                                    }
                                                }}
                                            />
                                            <Label
                                                htmlFor="select-all"
                                                className="text-sm"
                                            >
                                                Select all (
                                                {filteredOrders.length})
                                            </Label>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                disabled={
                                                    selectedOrderIDs.length ===
                                                        0 || isPdfDownloading
                                                }
                                                onClick={handleInvoice}
                                            >
                                                <Download className="h-4 w-4" />
                                                Download
                                            </Button>

                                            {role && role !== 'User' && (
                                                <Button
                                                    disabled={
                                                        selectedOrderIDs.length ===
                                                        0
                                                    }
                                                    variant="outline"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    Send
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {filteredOrders.map((order) => (
                                            <div
                                                key={order.orderID}
                                                className={cn(
                                                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                                                    selectedOrderIDs.includes(
                                                        order.orderID!
                                                    )
                                                        ? 'border-primary bg-primary/5'
                                                        : 'hover:bg-muted/50'
                                                )}
                                            >
                                                <Checkbox
                                                    id={`order-${order.orderID}`}
                                                    checked={selectedOrderIDs.includes(
                                                        order.orderID!
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSelect(
                                                            order.orderID!
                                                        )
                                                    }
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium truncate">
                                                            {order.orderID}
                                                        </h4>
                                                        <span className="text-sm text-muted-foreground">
                                                            {order.createdAt &&
                                                                format(
                                                                    new Date(
                                                                        order.createdAt
                                                                    ),
                                                                    'MMM dd'
                                                                )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {order.services
                                                                .map(
                                                                    (s) =>
                                                                        s.name
                                                                )
                                                                .join(', ')}
                                                        </p>
                                                        <span className="font-medium">
                                                            $
                                                            {order.total?.toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[400px]">
                                    <FileSearch className="h-10 w-10 text-muted-foreground mb-3" />
                                    <h4 className="font-medium text-lg mb-1">
                                        No orders found
                                    </h4>
                                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                                        {dateRange.from
                                            ? 'Try adjusting your date range'
                                            : 'Select a date range to view orders'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
