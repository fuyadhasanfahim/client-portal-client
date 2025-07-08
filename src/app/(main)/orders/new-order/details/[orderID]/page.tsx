import { getUserData } from '@/actions/user.action';
import RootNewOrderDetails from '@/components/orders/new-order/RootNewOrderDetails';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Details | Client Portal',
};

export default async function NewOrderDetailsPage({
    params,
}: {
    params: Promise<{ orderID: string }>;
}) {
    const { orderID } = await params;
    const user = await getUserData();
    return <RootNewOrderDetails orderID={orderID} userID={user.userID!} />;
}
