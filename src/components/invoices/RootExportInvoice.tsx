'use client';

import getLoggedInUser from '@/utils/getLoggedInUser';
import { useEffect, useMemo, useState } from 'react';
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
import { Download, FileSearch, Loader } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { ISanitizedUser } from '@/types/user.interface';
import toast from 'react-hot-toast';
import { useGetOrdersQuery } from '@/redux/features/orders/ordersApi';
import { IPayment } from '@/types/payment.interface';
import { useGetPaymentsByUserIDQuery } from '@/redux/features/payments/paymentApi';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import MultiOrderInvoiceTemplate from './MultiOrderInvoiceTemplate';
import { useGetUsersQuery } from '@/redux/features/users/userApi';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import ReactDOMServer from 'react-dom/server';

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

    const { data: allUsersData, isLoading: isAllUsersLoading } =
        useGetUsersQuery(role, {
            skip: !role || role !== 'admin',
        });

    const users = isAllUsersLoading ? [] : allUsersData?.users ?? [];

    const { data, isLoading } = useGetOrdersQuery(
        role === 'admin' ? { userID: selectedUserID, role } : { userID, role },
        {
            skip:
                (role === 'admin' && selectedUserID.length === 0) ||
                !userID ||
                !role,
        }
    );

    const orders = useMemo(() => {
        return !isLoading && data
            ? data.orders.filter(
                  (order: IOrder) => order.orderStage === 'payment-completed'
              )
            : [];
    }, [isLoading, data]);

    const { data: paymentsData, isLoading: isPaymentsLoading } =
        useGetPaymentsByUserIDQuery(selectedUserID, {
            skip: !selectedUserID,
        });

    const payments = !isPaymentsLoading ? paymentsData?.data || [] : [];

    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            const adjustedEndDate = new Date(dateRange.to);
            adjustedEndDate.setHours(23, 59, 59, 999);

            const filtered =
                orders?.filter((order: IOrder) => {
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
    }, [dateRange, JSON.stringify(orders)]);

    const toggleSelect = (id: string) => {
        setSelectedOrderIDs((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const getSelectedOrders = () =>
        filteredOrders.filter((o) => selectedOrderIDs.includes(o.orderID!));

    const generatePDF = async () => {
        if (typeof window === 'undefined') {
            throw new Error('Cannot generate PDF on server side');
        }

        setPdfDownloading(true);
        try {
            const selectedOrders = getSelectedOrders();
            if (selectedOrders.length === 0) {
                toast.error('Please select orders first');
                return;
            }

            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '210mm';
            tempDiv.style.padding = '20px';
            tempDiv.style.background = 'white';

            const client = selectedOrders[0].user;
            const htmlString = ReactDOMServer.renderToStaticMarkup(
                <MultiOrderInvoiceTemplate
                    orders={selectedOrders}
                    payments={payments.filter((p: IPayment) =>
                        selectedOrderIDs.includes(p.orderID)
                    )}
                    client={client}
                />
            );

            tempDiv.innerHTML = htmlString;
            document.body.appendChild(tempDiv);

            await new Promise((resolve) => setTimeout(resolve, 100));

            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                logging: true,
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: tempDiv.scrollWidth,
                windowHeight: tempDiv.scrollHeight,
            });

            if (!canvas) {
                throw new Error('Failed to generate canvas');
            }

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            document.body.removeChild(tempDiv);

            pdf.save(`invoice-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            toast.success('Invoice downloaded successfully');
        } catch (error) {
            toast.error('Failed to generate invoice');
        } finally {
            setPdfDownloading(false);
        }
    };

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

            await generatePDF();
        } catch (error) {
            ApiError(error);
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
                                        Select User
                                    </h3>
                                    <Select
                                        value={selectedUserID}
                                        onValueChange={(value) => {
                                            setSelectedUserID(value);
                                            setDateRange({
                                                from: undefined,
                                                to: undefined,
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a user..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map(
                                                (user: ISanitizedUser) => (
                                                    <SelectItem
                                                        key={user.userID}
                                                        value={user.userID}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarImage
                                                                    src={
                                                                        user.image
                                                                    }
                                                                    alt={
                                                                        user.name
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {user.name.charAt(
                                                                        0
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {user.name} (
                                                            {user.email})
                                                        </div>
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
                                                {isPdfDownloading ? (
                                                    <>
                                                        <Loader className="h-4 w-4 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4" />
                                                        Download
                                                    </>
                                                )}
                                            </Button>
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
