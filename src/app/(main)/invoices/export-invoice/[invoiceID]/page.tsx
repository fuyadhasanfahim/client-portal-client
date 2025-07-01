import RootInvoiceID from '@/components/invoices/RootInvoiceID';
import getAuthToken from '@/utils/getAuthToken';

export default async function InvoiceIDPage({
    params,
}: {
    params: Promise<{
        invoiceID: string;
    }>;
}) {
    const token = await getAuthToken();
    const { invoiceID } = await params;

    return <RootInvoiceID token={token as string} invoiceID={invoiceID} />;
}
