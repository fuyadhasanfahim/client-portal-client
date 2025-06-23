'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { IOrder, IOrderService, IOrderType } from '@/types/order.interface';
import IUser from '@/types/user.interface';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function InvoiceCard({
    order,
    authToken,
}: {
    order: IOrder;
    authToken: string;
}) {
    const [user, setUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch(
                `http://localhost:5000/api/users/get-user-by-id?user_id=${order.userID}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            const result = await res.json();
            setUser(result.data || null);
        };

        fetchUser();
    }, [order.userID, authToken]);

    const handleSendInvoice = async () => {
        try {
            if (!order._id) return;
            setIsLoading(true);

            const orderID = order._id;

            const response = await fetch(
                'http://localhost:5000/api/invoices/send-invoice-pdf-to-client',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ orderID }),
                }
            );

            if (response.ok) {
                toast.success('Invoice sent successfully.');
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to send invoice. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="w-full h-full flex items-center justify-center p-4 print:p-0">
            <Card className="max-w-4xl w-full mx-auto">
                <CardHeader className="flex flex-row justify-between items-start p-6 pb-4 border-b">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-3xl font-bold text-primary">
                                INVOICE
                            </CardTitle>
                            <Badge
                                variant="outline"
                                className="text-sm font-medium"
                            >
                                {order.orderID}
                            </Badge>
                        </div>
                        {order.createdAt && (
                            <p className="text-sm text-muted-foreground">
                                Issued:{' '}
                                {format(order.createdAt, 'MMMM dd, yyyy')}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg">
                        <Avatar className="size-14 ring-2 ring-primary/50">
                            <AvatarImage
                                src={user?.profileImage!}
                                alt={`${user?.name}'s profile image.`}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {user?.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <CardTitle className="font-semibold text-xl">
                                {user?.name || 'Client'}
                            </CardTitle>
                            <CardDescription className="text-sm">
                                {user?.email}
                            </CardDescription>
                            {user?.phone && (
                                <CardDescription className="text-sm">
                                    {user.phone}
                                </CardDescription>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-primary">
                                Order Summary
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">
                                        Status
                                    </p>
                                    <p className="font-medium capitalize">
                                        {order.status}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Payment
                                    </p>
                                    <p className="font-medium capitalize">
                                        {order.paymentStatus}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Order Type
                                    </p>
                                    <p className="font-medium">
                                        {order.services
                                            .map((s) => s.name)
                                            .join(', ')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Format
                                    </p>
                                    <p className="font-medium">
                                        {order.returnFileFormat}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Resizing
                                    </p>
                                    <p className="font-medium">
                                        {order.imageResizing}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Dimensions
                                    </p>
                                    <p className="font-medium">
                                        {order.width} x {order.height}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {order.instructions && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-primary">
                                    Special Instructions
                                </h3>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm italic">
                                        {order.instructions}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-primary">
                            Services Breakdown
                        </h3>
                        <div className="overflow-x-auto border rounded-lg">
                            <Table className="w-full">
                                <TableHeader className="bg-accent">
                                    <TableRow>
                                        <TableHead className="w-[40%] text-center font-medium text-primary border-r">
                                            Service
                                        </TableHead>
                                        <TableHead className="w-[40%] text-center font-medium text-primary border-r">
                                            Type & Complexity
                                        </TableHead>
                                        <TableHead className="w-[20%] text-center font-medium text-primary">
                                            Price
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.services.map(
                                        (service: IOrderService) => (
                                            <TableRow
                                                key={service._id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium text-center border-r">
                                                    {service.name}
                                                </TableCell>
                                                <TableCell className="text-center border-r">
                                                    {service.types
                                                        ?.map(
                                                            (t: IOrderType) =>
                                                                `${t.name} (${
                                                                    t.complexity
                                                                        ?.name ||
                                                                    'Standard'
                                                                })`
                                                        )
                                                        .join(', ') || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    ${' '}
                                                    {service.price ??
                                                        service.types?.reduce(
                                                            (sum, t) =>
                                                                sum +
                                                                (t.complexity
                                                                    ?.price ||
                                                                    0),
                                                            0
                                                        ) ??
                                                        0}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <div className="flex justify-between items-center gap-5 pr-8">
                            <span className="font-semibold">Total: </span>
                            <span className="text-xl font-bold text-primary">
                                $ {order.total}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 print:hidden pt-4 border-t">
                        <Button
                            variant="secondary"
                            onClick={() => window.print()}
                        >
                            Print Invoice
                        </Button>
                        <Button
                            onClick={handleSendInvoice}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="animate-spin" />}
                            {isLoading ? 'Sending...' : 'Send to Client'}
                        </Button>
                    </div>

                    <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
                        <p>Thank you for your business!</p>
                        <p className="mt-1">
                            For any questions, please contact our support team.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
