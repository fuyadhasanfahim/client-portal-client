'use client';

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { IOrder } from '@/types/order.interface';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { generatePDF } from '@/utils/pdf-generator';
import toast from 'react-hot-toast';
import { Label } from '../ui/label';
import { FileSearch, FileUp, FileText, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { downloadOrdersPdf } from '@/utils/downloadPdf';

export default function ExportInvoices({
    orders,
    role,
}: {
    orders: IOrder[];
    role: string;
}) {
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to?: Date | undefined;
    }>({ from: undefined, to: undefined });
    const [filteredOrders, setFilteredOrders] = useState<IOrder[]>([]);
    const [selectedOrderIDs, setSelectedOrderIDs] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        if (selectAll) {
            setSelectedOrderIDs(filteredOrders.map((order) => order.orderID!));
        } else {
            setSelectedOrderIDs([]);
        }
    }, [selectAll, filteredOrders]);

    const toggleSelect = (id: string) => {
        setSelectedOrderIDs((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const getSelectedOrders = () =>
        filteredOrders.filter((o) => selectedOrderIDs.includes(o.orderID!));

    const handleExportExcel = () => {
        const selectedOrders = getSelectedOrders();
        if (selectedOrders.length === 0) {
            toast.error('Please select at least one order to export');
            return;
        }

        try {
            const exportData = selectedOrders.map((order) => ({
                'Order ID': order.orderID,
                'Order Date': order.createdAt
                    ? format(order.createdAt, 'PPPp')
                    : 'N/A',
                Services: order.services.map((s) => s.name).join(', '),
                'Images Count': order.images,
                'Total Price': `$${order.total?.toFixed(2)}`,
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
            XLSX.writeFile(
                workbook,
                `invoices_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`
            );
            toast.success('Excel file exported successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to export Excel file');
        }
    };

    const handleExportPDF = async (type: 'single' | 'multiple') => {
        const selectedOrders = getSelectedOrders();
        if (selectedOrders.length === 0) {
            toast.error('Please select at least one order to export');
            return;
        }

        setIsLoading(true);
        try {
            console.log(type);
            await downloadOrdersPdf(orders);
            toast.success('PDF exported successfully');
        } catch (error) {
            toast.error('Failed to generate PDF');
            console.error('PDF generation error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendToClient = (type: 'pdf' | 'excel') => {
        if (selectedOrderIDs.length === 0) {
            toast.error('Please select at least one order');
            return;
        }
        toast.loading(`Preparing to send ${type.toUpperCase()} to clients...`);
        setTimeout(() => {
            toast.success(`Sent ${type.toUpperCase()} to selected clients`);
        }, 2000);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileUp className="h-4 w-4" />
                    Export Invoices
                </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-4xl p-0 max-h-[calc(100vh-20px)] overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-xl">
                        Export Invoices
                    </DialogTitle>
                    <DialogDescription>
                        Select orders to export as Excel or PDF
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0 h-[480px]">
                    {/* Left sidebar - Filters */}
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
                                            onClick={(pre) =>
                                                setSelectAll(!pre)
                                            }
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <ScrollArea className="h-[500px]">
                        <div className="p-4">
                            {filteredOrders.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectAll}
                                                onCheckedChange={(checked) =>
                                                    setSelectAll(!!checked)
                                                }
                                            />
                                            <Label
                                                htmlFor="select-all"
                                                className="text-sm"
                                            >
                                                Select all (
                                                {filteredOrders.length})
                                            </Label>
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

                <DialogFooter className="p-4 border-t bg-muted/50">
                    <div className="flex items-center justify-between w-full">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleExportExcel}
                                disabled={selectedOrderIDs.length === 0}
                                variant="outline"
                                className="gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Excel
                            </Button>
                            <Button
                                onClick={() => handleExportPDF('multiple')}
                                disabled={
                                    selectedOrderIDs.length === 0 || isLoading
                                }
                                className="gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                {isLoading ? 'Generating...' : 'PDF'}
                            </Button>
                            {role && role !== 'User' && (
                                <Button
                                    onClick={() => handleSendToClient('pdf')}
                                    disabled={selectedOrderIDs.length === 0}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    Send
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
