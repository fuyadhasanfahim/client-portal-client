import { Metadata } from 'next';
import getAuthToken from '@/utils/getAuthToken';
import RootExportInvoice from '@/components/invoices/RootExportInvoice';

export const metadata: Metadata = {
    title: 'Export Invoice | Client Portal',
    description: 'Invoices | Client Portal',
};

export default async function ExportInvoicePage() {
    const authToken = await getAuthToken();

    return <RootExportInvoice authToken={authToken as string} />;
}
