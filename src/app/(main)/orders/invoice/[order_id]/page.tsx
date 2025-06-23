import InvoiceCard from '@/components/orders/invoice/InvoiceCard';
import getAuthToken from '@/utils/getAuthToken';

interface InvoicePageProps {
    order_id: string;
}

export default async function InvoicePage({
    params,
}: {
    params: Promise<InvoicePageProps>;
}) {
    const { order_id } = await params;
    const authToken = await getAuthToken();

    const response = await fetch(
        `http://localhost:5000/api/orders/get-order-by-id?order_id=${order_id}`,
        {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        }
    );
    const result = await response.json();
    const order = result.data;

    if (!order) {
        return <div className="text-red-500">Order not found</div>;
    }

    return <InvoiceCard order={order} authToken={authToken as string} />;
}
