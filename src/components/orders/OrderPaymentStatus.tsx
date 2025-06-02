import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { CircleCheckBig, Loader } from 'lucide-react';

export default function OrderPaymentStatus({
    paymentStatus,
}: {
    paymentStatus: string;
}) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'capitalize',
                paymentStatus === 'Paid' &&
                    'text-green-500 border-green-500 bg-green-50',
                paymentStatus === 'Refunded' &&
                    'text-blue-500 border-blue-500 bg-blue-50',
                paymentStatus === 'Pending' &&
                    'text-orange-500 border-orange-500 bg-orange-50',
                paymentStatus === 'Pay Later' &&
                    'text-yellow-500 border-yellow-500 bg-yellow-50'
            )}
        >
            {paymentStatus === 'Paid' ? (
                <CircleCheckBig size={16} />
            ) : (
                <Loader size={16} />
            )}
            {paymentStatus}
        </Badge>
    );
}
