'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ApiError from '@/components/shared/ApiError';
import InvoicePDF from './InvoicePDF';

interface Props {
    invoiceID: string;
    token: string;
}

export default function RootInvoiceID({ invoiceID, token }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [invoice, setInvoice] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/get-invoice-by-id?invoiceID=${invoiceID}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const result = await response.json();
                if (result.success) setInvoice(result.data);
            } catch (error) {
                ApiError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvoice();
    }, [invoiceID, token]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 size={40} className="animate-spin" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="text-center text-red-500">Invoice not found.</div>
        );
    }

    return <InvoicePDF invoice={invoice} />;
}
