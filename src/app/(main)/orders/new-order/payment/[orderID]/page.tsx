import { getUserData } from '@/actions/user.action';
import RootNewOrderPayment from '@/components/orders/new-order/RootNewOrderPayment';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Review Order | Client Portal',
};

export default async function NewOrderPaymentPage({
    params,
}: {
    params: Promise<{ orderID: string }>;
}) {
    const { orderID } = await params;
    const user = await getUserData();

    return (
        <RootNewOrderPayment
            orderID={orderID}
            userID={user.userID!}
        />
    );
}
