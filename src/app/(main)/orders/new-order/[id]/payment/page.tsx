import RootNewOrderPayment from '@/components/orders/new-order/RootNewOrderPayment';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Review Order | Client Portal',
};

export default function NewOrderPaymentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return <RootNewOrderPayment params={params} />;
}
