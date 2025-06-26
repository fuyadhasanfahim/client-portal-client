import RootInvoice from '@/components/invoices/RootInvoice';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invoices | Client Portal',
    description: 'Invoices | Client Portal',
};

export default function InvoicesPage() {
    return <RootInvoice />;
}
