'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { IOrder, IOrderService } from '@/types/order.interface';
import IUser from '@/types/user.interface';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function InvoiceCard({
    order,
    authToken,
}: {
    order: IOrder;
    authToken: string;
}) {
    const { data: session } = useSession();
    const [user, setUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/get-user-by-id?user_id=${order.userID}`,
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
            if (!order.orderID) return;
            setIsLoading(true);

            const orderID = order.orderID;

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/send-invoice-pdf-to-client`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ orderID }),
                }
            );

            console.log(response);

            if (response.ok) {
                toast.success('Invoice sent successfully.');
            } else {
                toast.error('Failed to send invoice.');
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
        <section className="w-full h-full flex flex-col gap-6 items-center justify-center p-4 print:p-0">
            <div className="flex flex-col sm:flex-row justify-end gap-3 print:hidden">
                <Button
                    variant={
                        (session &&
                            (session.user.role !== 'User'
                                ? 'secondary'
                                : 'default')) ||
                        'default'
                    }
                    onClick={() => window.print()}
                >
                    Print Invoice
                </Button>
                {session && session.user.role !== 'User' && (
                    <Button onClick={handleSendInvoice} disabled={isLoading}>
                        {isLoading && <Loader2 className="animate-spin" />}
                        {isLoading ? 'Sending...' : 'Send to Client'}
                    </Button>
                )}
            </div>

            <Card className="max-w-3xl w-full mx-auto">
                <CardHeader className="flex flex-row justify-between items-start p-6 pb-4 border-b">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-3xl font-bold text-primary uppercase">
                                Invoice
                            </CardTitle>
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
                                src={user?.image || undefined}
                                alt={`${
                                    user?.name ?? 'Client'
                                }'s profile image.`}
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

                <CardContent className="space-y-6">
                    <div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-primary">
                                Order Summary
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <strong className="text-muted-foreground">
                                        Order ID:
                                    </strong>
                                    <p className="font-medium">
                                        {order.orderID}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <strong className="text-muted-foreground">
                                        Status:
                                    </strong>
                                    <p className="font-medium capitalize">
                                        {order.status}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <strong className="text-muted-foreground">
                                        Payment:
                                    </strong>
                                    <p className="font-medium capitalize">
                                        {order.paymentStatus}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <strong className="text-muted-foreground">
                                        Format:
                                    </strong>
                                    <p className="font-medium">
                                        {order.returnFileFormat}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <strong className="text-muted-foreground">
                                        Resizing:
                                    </strong>
                                    <p className="font-medium">
                                        {order.imageResizing}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <strong className="text-muted-foreground">
                                        Dimensions:
                                    </strong>
                                    <p className="font-medium">
                                        {order.width} x {order.height}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-primary">
                            Services Breakdown
                        </h3>
                        <div className="overflow-x-auto border rounded-lg">
                            <Table className="w-full">
                                <TableHeader className="bg-accent">
                                    <TableRow>
                                        <TableHead className="w-[25%] text-center font-medium border-r">
                                            Service
                                        </TableHead>
                                        <TableHead className="w-[25%] text-center font-medium border-r">
                                            Type & Complexity
                                        </TableHead>
                                        <TableHead className="w-[10%] text-center font-medium border-r">
                                            Images
                                        </TableHead>
                                        <TableHead className="w-[20%] text-center font-medium border-r">
                                            Price/Image
                                        </TableHead>
                                        <TableHead className="w-[20%] text-center font-medium">
                                            Total
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.services.map(
                                        (
                                            service: IOrderService,
                                            index: number
                                        ) => {
                                            const imageCount =
                                                order.images || 0;

                                            const typeNames =
                                                service.types &&
                                                service.types.length > 0
                                                    ? service.types
                                                          .map((t) =>
                                                              t.complexity?.name
                                                                  ? `${t.name} (${t.complexity.name})`
                                                                  : t.name
                                                          )
                                                          .join(', ')
                                                    : service.complexity?.name
                                                    ? service.complexity.name
                                                    : service.colorCodes?.length
                                                    ? service.colorCodes
                                                          .map((c) => `#${c}`)
                                                          .join(', ')
                                                    : 'N/A';
                                            let pricePerImage = 0;

                                            if (
                                                typeof service.price ===
                                                'number'
                                            ) {
                                                pricePerImage = service.price;
                                            } else if (service.types?.length) {
                                                pricePerImage =
                                                    service.types.reduce(
                                                        (sum, t) => {
                                                            if (
                                                                typeof t.price ===
                                                                'number'
                                                            )
                                                                return (
                                                                    sum +
                                                                    t.price
                                                                );
                                                            return (
                                                                sum +
                                                                (t.complexity
                                                                    ?.price ||
                                                                    0)
                                                            );
                                                        },
                                                        0
                                                    );
                                            } else if (
                                                service.complexity?.price
                                            ) {
                                                pricePerImage =
                                                    service.complexity.price;
                                            }

                                            const totalPrice =
                                                pricePerImage * imageCount;

                                            return (
                                                <TableRow
                                                    key={service._id}
                                                    className="break-inside-avoid print:break-inside-avoid"
                                                >
                                                    <TableCell className="text-start border-r font-medium">
                                                        {index + 1}.{' '}
                                                        {service.name}
                                                    </TableCell>
                                                    <TableCell className="text-start border-r whitespace-normal break-words">
                                                        {typeNames}
                                                    </TableCell>
                                                    <TableCell className="text-center border-r">
                                                        {imageCount}
                                                    </TableCell>
                                                    <TableCell className="text-center border-r">
                                                        $
                                                        {pricePerImage.toFixed(
                                                            2
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium">
                                                        ${totalPrice.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }
                                    )}

                                    <TableRow className="bg-muted font-semibold print:bg-transparent">
                                        <TableCell
                                            colSpan={4}
                                            className="text-end border-r pr-4"
                                        >
                                            Grand Total
                                        </TableCell>
                                        <TableCell className="text-center">
                                            ${order.total?.toFixed(2) || '0.00'}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-center flex-col border-t">
                    <h3>Thank you for your business!</h3>
                    <CardDescription>
                        For any questions, please contact our support team.
                    </CardDescription>
                </CardFooter>
            </Card>
        </section>
    );
}
