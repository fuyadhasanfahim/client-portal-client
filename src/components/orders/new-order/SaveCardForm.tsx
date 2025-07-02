'use client';

import {
    useStripe,
    useElements,
    PaymentElement,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ApiError from '@/components/shared/ApiError';

export default function SaveCardForm({
    userID,
    orderID,
    customerId,
}: {
    userID: string;
    orderID: string;
    customerId: string;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    const handleSaveCard = async () => {
        if (!stripe || !elements) return;

        const result = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: 'if_required',
        });

        if (result.error) {
            ApiError(result.error.message);
            return;
        }

        const setupIntent = result.setupIntent;

        const res = await fetch('/api/payments/new-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userID,
                orderID,
                paymentOption: 'Pay Later',
                paymentIntentId: setupIntent.id,
                customerId,
                status: setupIntent.status,
            }),
        });

        const dbResult = await res.json();
        if (dbResult.success) {
            router.push('/orders');
        } else {
            ApiError(dbResult.message);
        }
    };

    return (
        <div className="space-y-4">
            <PaymentElement />
            <Button onClick={handleSaveCard} className="w-full">
                Save Card & Continue
            </Button>
        </div>
    );
}
