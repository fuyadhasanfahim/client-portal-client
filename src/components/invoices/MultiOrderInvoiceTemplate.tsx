'use client';

import { format } from 'date-fns';
import {
    IOrder,
    IOrderServiceSelection,
    IOrderUser,
} from '@/types/order.interface';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
    TableFooter,
} from '@/components/ui/table';
import Image from 'next/image';
import { IPayment } from '@/types/payment.interface';

export default function MultiOrderInvoiceTemplate({
    orders,
    payments,
    client,
}: {
    orders: IOrder[];
    payments: IPayment[];
    client: IOrderUser;
}) {
    const totalAmount = orders.reduce(
        (sum, order) => sum + (order.total || 0),
        0
    );
    const totalTax = payments.reduce(
        (sum, payment) => sum + (payment.tax || 0),
        0
    );

    return (
        <div
            id="invoice-content"
            className="bg-white p-8 border print:border-none border-gray-200"
        >
            <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                <div className="mb-6 md:mb-0">
                    <Image
                        src="https://res.cloudinary.com/dny7zfbg9/image/upload/v1751019279/tygwvniej4dtd9a7g8sx.svg"
                        alt="Company Logo"
                        width={200}
                        height={50}
                        className="h-10 w-auto"
                    />
                </div>

                <div className="text-right">
                    <h1 className="text-3xl font-bold text-amber-500 mb-1">
                        INVOICE
                    </h1>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Invoice #:</span>{' '}
                            {`INV-${format(
                                new Date(),
                                'yyyyMMdd'
                            )}-${Math.floor(Math.random() * 1000)}`}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Date:</span>{' '}
                            {format(new Date(), 'PPP')}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Orders:</span>{' '}
                            {orders.length} orders
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                        Bill To
                    </h3>
                    {client.company ? (
                        <p className="font-medium">{client.company},</p>
                    ) : (
                        <p className="font-medium">{client.name}</p>
                    )}
                    {client.address && (
                        <p className="text-gray-600">{client.address}</p>
                    )}
                    {client.email && (
                        <p className="text-gray-600">{client.email}</p>
                    )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                        Bill From
                    </h3>
                    <p className="font-medium">Web Briks LLC,</p>
                    <p className="text-gray-600">
                        1209, Mountain Road PL NE, STE R, ALBUQUERQUE, NM,
                        87110, US.
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                {orders.map((order, orderIndex) => {
                    const payment = payments.find(
                        (p) => p.orderID === order.orderID
                    );
                    return (
                        <div
                            key={order.orderID}
                            className="border border-gray-200 rounded-lg p-4"
                        >
                            <div className="mb-4">
                                <h3 className="font-medium text-amber-600">
                                    Order #{orderIndex + 1}: {order.orderID}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Date:{' '}
                                    {format(new Date(order.createdAt), 'PPP')}
                                </p>
                            </div>

                            <Table className="mb-4">
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead className="w-[100px] font-semibold">
                                            Item
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Description
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Qty
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Price
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Amount
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.services?.map(
                                        (
                                            service: IOrderServiceSelection,
                                            index: number
                                        ) => (
                                            <TableRow
                                                key={index}
                                                className="border-b border-gray-100"
                                            >
                                                <TableCell className="font-medium">
                                                    #{index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {service.name}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    1
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    ${service.price?.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    ${service.price?.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                                <TableFooter className="bg-transparent">
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-right font-semibold"
                                        >
                                            Subtotal
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ${order.total?.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                    {payment?.tax && payment.tax > 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-right font-semibold"
                                            >
                                                Tax
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ${payment.tax.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableFooter>
                            </Table>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
                <Table>
                    <TableFooter className="bg-transparent">
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="text-right font-bold text-lg"
                            >
                                Subtotal
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg">
                                ${totalAmount.toFixed(2)}
                            </TableCell>
                        </TableRow>
                        {totalTax > 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-right font-bold text-lg"
                                >
                                    Total Tax
                                </TableCell>
                                <TableCell className="text-right font-bold text-lg">
                                    ${totalTax.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="text-right font-bold text-lg"
                            >
                                Grand Total
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg text-amber-500">
                                ${(totalAmount + totalTax).toFixed(2)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 italic">
                    Thank you for your business. Please make payments within 30
                    days of receiving this invoice.
                </p>
            </div>
        </div>
    );
}
