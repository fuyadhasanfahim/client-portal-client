import { Metadata } from 'next';
import RootOrderDetails from '@/components/orders/order-details/RootOrderDetails';
import { getUserData } from '@/actions/user.action';

type OrderDetailsPageProps = {
    params: Promise<{ order_id: string }>;
};

export const metadata: Metadata = {
    title: 'Order Details | Client Portal',
};

export default async function OrderDetailsPage({
    params,
}: OrderDetailsPageProps) {
    const { order_id } = await params;

    const user = await getUserData();

    return <RootOrderDetails orderID={order_id} role={user.role} />;
}
