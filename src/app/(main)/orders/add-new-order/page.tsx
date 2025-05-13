import { getUserData } from '@/actions/user.action';
import AddOrderForm from '@/components/orders/AddOrderForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Add New Order | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default async function AddNewOrderPage() {
    const data = await getUserData();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Order</CardTitle>
            </CardHeader>
            <CardContent>
                <AddOrderForm userId={data?.userId} />
            </CardContent>
        </Card>
    );
}
