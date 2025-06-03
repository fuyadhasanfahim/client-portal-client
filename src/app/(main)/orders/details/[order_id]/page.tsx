import { Metadata } from 'next';
import { getUserData } from '@/actions/user.action';
import RootOrderDetails from '@/components/orders/order-details/RootOrderDetails';

type OrderDetailsPageProps = {
    params: Promise<{ order_id: string }>;
};

export const metadata: Metadata = {
    title: 'Order Details | Client Portal',
};

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
    const { order_id } = await params;

    const userData = await getUserData();

    return (
        <RootOrderDetails
            orderID={order_id}
            user={{
                name: userData.name,
                userID: userData.userID,
                role: userData.role,
                profileImage: userData.profileImage,
            }}
        />
    );
}
