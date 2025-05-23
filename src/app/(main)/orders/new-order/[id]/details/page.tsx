import RootNewOrderDetails from '@/components/orders/new-order/RootNewOrderDetails';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Details | Client Portal',
};

export default function NewOrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return <RootNewOrderDetails params={params} />;
}
