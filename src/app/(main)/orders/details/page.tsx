import RootOrderDetails from '@/components/orders/order-details/RootOrderDetails';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Details| Client Portal',
};

export default async function OrderDetailsPage({
    searchParams,
}: {
    searchParams: {
        id: string;
        status: string;
    };
}) {
    const { id, status } = await searchParams;

    return <RootOrderDetails id={id} status={status} />;
}
