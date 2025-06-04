import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface OrderDetailsPaymentAndDetailsProps {
    status: string;
    total?: number;
    paymentId?: string;
    paymentMethod?: string;
    paymentOption?: string;
    role: string;
}

export default function OrderDetailsPaymentAndDetails({
    status,
    total,
    paymentId,
    paymentMethod,
    paymentOption,
    role,
}: OrderDetailsPaymentAndDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>📦 Order Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {status}
                </Badge>
                <p>
                    <strong>Total Price:</strong> ${total || 'N/A'}
                </p>
                <p>
                    <strong>Payment Method:</strong> {paymentMethod || 'N/A'}
                </p>
                <p>
                    <strong>Payment Option:</strong> {paymentOption || 'N/A'}
                </p>
                <p>
                    <strong>Payment ID:</strong> {paymentId || 'N/A'}
                </p>
            </CardContent>
            {role !== 'User' && (
                <CardFooter>
                    <Button className="w-full">Deliver Now</Button>
                </CardFooter>
            )}
        </Card>
    );
}
