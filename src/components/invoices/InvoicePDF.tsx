import { IInvoice } from '@/types/invoice.interface';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';

export default function InvoicePDF({ invoice }: { invoice: IInvoice }) {
    return (
        <section>
            <Button
                onClick={() => {
                    if (typeof window !== 'undefined') {
                        const filename = `Invoice-${invoice.invoiceID}-${format(
                            invoice.date.to,
                            'yyyyMMddHHmm'
                        )}.pdf`;
                        const prevTitle = document.title;
                        document.title = filename;
                        window.print();
                        setTimeout(() => {
                            document.title = prevTitle;
                        }, 1000);
                    }
                }}
                className="mb-5 print:hidden"
            >
                Print
            </Button>

            <div className="print-only">
                <Card className="rounded-none w-[595px] print:w-full h-[842px] print:h-[calc(100vh-40px)] mx-auto p-8 flex flex-col print:!p-0 print:border-0">
                    <CardHeader className="flex items-center justify-between p-0 mb-8">
                        <figure className="flex items-center">
                            <Image
                                src={
                                    'https://res.cloudinary.com/dny7zfbg9/image/upload/v1751019279/tygwvniej4dtd9a7g8sx.svg'
                                }
                                alt="Webbriks LLC logo"
                                width={213}
                                height={28.71}
                                priority
                                className="h-8 w-auto"
                            />
                        </figure>

                        <div className="text-right">
                            <h2 className="text-2xl font-bold uppercase text-amber-500 mb-1">
                                Invoice
                            </h2>
                            <h4 className="text-sm font-medium text-gray-600">
                                #{invoice.invoiceID}
                            </h4>
                            <p className="text-xs text-gray-500">
                                Due Date: {format(invoice.date.to, 'PPP')}
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 flex-1 flex flex-col">
                        <div className="grid grid-cols-2 items-start justify-between w-full gap-32 mb-8">
                            <div className="space-y-1 text-left">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">
                                    Bill To
                                </h3>
                                <h4 className="text-base font-semibold">
                                    {invoice.client.company ||
                                        invoice.client.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {invoice.client.address || 'N/A'}
                                </p>
                            </div>

                            <div className="space-y-1 text-right">
                                <h3 className="text-sm font-medium text-gray-500 uppercase">
                                    Bill From
                                </h3>
                                <h4 className="text-base font-semibold">
                                    {invoice.company.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {invoice.company.address}
                                </p>
                            </div>
                        </div>

                        <Table className="mb-8">
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold text-gray-700">
                                        Order ID
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">
                                        Services
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">
                                        Images
                                    </TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700">
                                        Price
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.orders?.map((order) => {
                                    const {
                                        orderID,
                                        services,
                                        details,
                                        total,
                                    } = order || {};

                                    return (
                                        <TableRow
                                            key={orderID}
                                            className="border-b border-gray-100"
                                        >
                                            <TableCell className="font-medium text-gray-800">
                                                {orderID}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {services
                                                    .slice(0, 3)
                                                    .map((s) => s.name)
                                                    .join(', ')}
                                                {services.length > 3 && '...'}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {details?.images}
                                            </TableCell>
                                            <TableCell className="text-right text-gray-800 font-medium">
                                                ${total?.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                            <TableFooter className="bg-transparent">
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-right font-semibold text-gray-700"
                                    >
                                        Total
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-lg text-amber-500">
                                        ${invoice.total?.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>

                        {/* Thank You Message */}
                    </CardContent>

                    <CardFooter className="flex items-center justify-center flex-col">
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-500 italic">
                                Thank you for your business! We appreciate your
                                trust in our services.
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                If you have any questions about this invoice,
                                please contact us at info@webbriks.com
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </section>
    );
}
