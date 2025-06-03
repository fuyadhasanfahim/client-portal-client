import { cn } from '@/lib/utils';
import { CircleCheckBig, Loader } from 'lucide-react';

export default function OrderPaymentStatus({
    paymentStatus,
}: {
    paymentStatus: string;
}) {
    return (
        <div
            className={cn(
                'capitalize flex items-center gap-2 justify-center',
                paymentStatus === 'Paid' && 'text-green-500 border-green-500',
                paymentStatus === 'Refunded' && 'text-blue-500 border-blue-500',
                paymentStatus === 'Pending' &&
                    'text-orange-500 border-orange-500',
                paymentStatus === 'Pay Later' &&
                    'text-yellow-500 border-yellow-500'
            )}
        >
            {paymentStatus === 'Paid' ? (
                <CircleCheckBig size={16} />
            ) : (
                <Loader size={16} />
            )}
            {paymentStatus}
        </div>
    );
}
