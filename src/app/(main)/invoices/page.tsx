import RootInvoice from '@/components/invoices/RootInvoice';
import getAuthToken from '@/utils/getAuthToken';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invoices | Client Portal',
    description: 'Invoices | Client Portal',
};

export default async function InvoicesPage() {
    const authToken = await getAuthToken();

    return <RootInvoice authToken={authToken as string} />;
}
