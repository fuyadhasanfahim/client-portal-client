import { getUserData } from '@/actions/user.action';
import OrderServices from '@/components/orders/new-order/OrderServices';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'New Order | Client Portal',
    description: 'Create a new order',
};

export default async function NewOrderPage() {
    const user = await getUserData();

    return <OrderServices userID={user.userID} />;
}
