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
import { Download, FileSearch, Loader, Send } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { ISanitizedUser, IUser } from '@/types/user.interface';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';
import { useGetOrdersQuery } from '@/redux/features/orders/ordersApi';
import { IPayment } from '@/types/payment.interface';
import { useGetPaymentByOrderIDQuery } from '@/redux/features/payments/paymentApi';
import { MultiSelect } from '../shared/multi-select';
import { useGetUsersQuery } from '@/redux/features/users/userApi';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function RootExportInvoice() {
    const { user } = getLoggedInUser();
    const { userID, role } = user;

    const [isPdfDownloading, setPdfDownloading] = useState(false);
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to?: Date | undefined;
    }>({ from: undefined, to: undefined });
    const [filteredOrders, setFilteredOrders] = useState<IOrder[]>([]);
    const [selectedOrderIDs, setSelectedOrderIDs] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedUserID, setSelectedUserID] = useState<string>('');

    const router = useRouter();
    const { data: allUsersData, isLoading: isAllUsersLoading } =
        useGetUsersQuery(role, {
            skip: !role || role !== 'admin',
        });

    const users = !isAllUsersLoading ? [] : allUsersData?.users ?? [];
    console.log(allUsersData);

    const { data, isLoading } = useGetOrdersQuery(
        role === 'admin' ? { userID: selectedUserID, role } : { userID, role },
        {
            skip:
                (role === 'admin' && selectedUserID.length === 0) ||
                !userID ||
                !role,
        }
    );

    const orders: IOrder[] =
        !isLoading &&
        data &&
        data.orders.filter(
            (order: IOrder) => order.orderStage === 'payment-completed'
        );

    const { data: paymentsData, isLoading: isPaymentsLoading } =
        useGetPaymentByOrderIDQuery(selectedOrderIDs, {
            skip: selectedOrderIDs.length === 0,
        });

    const payments = !isPaymentsLoading ? paymentsData?.payments || [] : [];

    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            const adjustedEndDate = new Date(dateRange.to);
            adjustedEndDate.setHours(23, 59, 59, 999);

            const filtered =
                orders?.filter((order) => {
                    if (!order.createdAt) return false;
                    const createdAt = new Date(order.createdAt);
                    return (
                        dateRange.from !== undefined &&
                        createdAt >= dateRange.from &&
                        createdAt <= adjustedEndDate
                    );
                }) || [];
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(orders || []);
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

    const authToken = '';

    const handleInvoice = async () => {
        try {
            const selectedOrders = getSelectedOrders();
            if (isLoading || isPaymentsLoading) {
                return;
            }

            if (selectedOrders.length === 0) {
                toast.error('Please select orders');
                return;
            }

            // Check if all selected orders have payment info
            const ordersWithoutPayment = selectedOrders.filter(
                (order) =>
                    !payments.some(
                        (payment: IPayment) => payment.orderID === order.orderID
                    )
            );

            if (ordersWithoutPayment.length > 0) {
                toast.error(
                    'Some selected orders are missing payment information'
                );
                return;
            }

            const uniqueClients = new Set(
                selectedOrders.map((o) => o.user.userID)
            );
            if (uniqueClients.size > 1) {
                toast.error(
                    'All selected orders must belong to the same client'
                );
                return;
            }

            setPdfDownloading(true);

            const client = selectedOrders[0].user;

            const subTotal = payments.reduce(
                (sum: number, payment: IPayment) => sum + (payment.amount || 0),
                0
            );

            const taxAmount = payments.reduce(
                (sum: number, payment: IPayment) => sum + (payment.tax || 0),
                0
            );

            const total = subTotal + taxAmount;

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
                            company: client.company,
                            address: client.address || 'N/A',
                            email: client.email || 'N/A',
                        },
                        company: {
                            name: 'Web Briks LLC',
                            address:
                                'Web briks, LLC. 1209, Mountain Road PL NE, STE R, ALBUQUERQUE, NM, 87110, US.',
                            phone: '+1 718 577 1232',
                        },
                        orders: selectedOrders,
                        payments: payments.filter((payment: IPayment) =>
                            selectedOrderIDs.includes(payment.orderID)
                        ),
                        date: {
                            ...dateRange,
                            issued: new Date(),
                        },
                        subTotal,
                        taxAmount,
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
                            {role === 'admin' && (
                                <div>
                                    <h3 className="font-medium text-sm mb-2">
                                        Select Users
                                    </h3>

                                    <Select
                                        value={selectedUserID}
                                        onValueChange={setSelectedUserID}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select users..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map(
                                                (
                                                    user: ISanitizedUser,
                                                    idx: number
                                                ) => (
                                                    <SelectItem
                                                        key={idx}
                                                        value={user.userID}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Avatar className="size-5">
                                                            <AvatarImage
                                                                src={user.image}
                                                                alt="user image"
                                                            />
                                                            <AvatarFallback>
                                                                <Loader />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {user.name}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

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
                            {role === 'admin' && !selectedUserID ? (
                                <div className="flex flex-col items-center justify-center h-[400px]">
                                    <FileSearch className="h-10 w-10 text-muted-foreground mb-3" />
                                    <h4 className="font-medium text-lg mb-1">
                                        Select users to view orders
                                    </h4>
                                </div>
                            ) : filteredOrders.length > 0 ? (
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
                                                        0 ||
                                                    isPdfDownloading ||
                                                    isPaymentsLoading
                                                }
                                                onClick={handleInvoice}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>

                                            {role && role !== 'User' && (
                                                <Button
                                                    disabled={
                                                        selectedOrderIDs.length ===
                                                            0 ||
                                                        isPaymentsLoading
                                                    }
                                                    variant="outline"
                                                >
                                                    <Send className="h-4 w-4 mr-2" />
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
                                                            {order.user.name ||
                                                                order.user
                                                                    .email}
                                                        </p>
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
