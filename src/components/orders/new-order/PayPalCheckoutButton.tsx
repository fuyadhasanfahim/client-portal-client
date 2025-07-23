import { IOrder } from '@/types/order.interface';
import getAuthToken from '@/utils/getAuthToken';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { getSession } from 'next-auth/react';

export default function PayPalCheckoutButton({ order }: { order: IOrder }) {
    return (
        <PayPalScriptProvider
            options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                currency: 'USD',
            }}
        >
            <PayPalButtons
                style={{ layout: 'vertical' }}
                // Temporarily modify your createOrder function to log the response
                createOrder={async () => {
                    try {
                        const session = await getAuthToken();
                        console.log('Sending order data:', {
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: 'USD',
                                        value: (order.total ?? 0).toString(),
                                    },
                                },
                            ],
                        });

                        const res = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/paypal`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..9eSpar_4psyvyQFV.dP4EdnGi8D4U6vA5TPwk3YqmARr3pxO5Bn25HCJWcKgLveuuRg8ShcgnV3t12QAggRxyQvj-Y-48KVZ-xYA5m2mli4iEv7OJHbCnyUG9trtrNCJKyPq3KVpTQ-Y-hhft1gtPIe1hnARfvWeDGQkFzXUbyWCskDVVL-uwLb707CTDSm27VgeIL4M2ieGpuaYwoUgZL9Ei7MvAQq4b9Yv98uUXQnzldzxMljJjyCM-IHKOhkrtElVuGvxLCQPsaGfl2opRiWUzA26UEIQpimFyVW8cBMlVU1Vp7nP8wQ9ehdi-KHQVZ_JHvc9pA9DUPpjYTWx9Q4quExkqPPnW03S9k_VLIqGTHbYKt14slDnCsR07cjaKiWDQZIqbcOua42FcPqwbJutBj859XVioNMPvhXLmYWsIouTRYRET.bKD2ZEF3i9Ps8hmA4ByiwA`,
                                },
                                body: JSON.stringify({
                                    purchase_units: [
                                        {
                                            amount: {
                                                currency_code: 'USD',
                                                value: (
                                                    order.total ?? 0
                                                ).toString(),
                                            },
                                        },
                                    ],
                                }),
                            }
                        );

                        console.log('Response status:', res.status);
                        const data = await res.json();
                        console.log('Response data:', data);

                        if (!res.ok)
                            throw new Error(
                                data.message || 'Failed to create order'
                            );
                        return data.id;
                    } catch (err) {
                        console.error('Full create order error:', err);
                        throw err;
                    }
                }}
                onApprove={async (data, actions) => {
                    try {
                        const res = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/paypal/${data.orderID}/capture`,
                            { method: 'POST' }
                        );
                        if (!res.ok) throw new Error('Capture failed');
                        const details = await res.json();
                        console.log('Payment Approved:', details);
                        // Add your success logic here
                    } catch (err) {
                        console.error('Capture error:', err);
                    }
                }}
                onError={(err) => {
                    console.error('PayPal error', err);
                }}
            />
        </PayPalScriptProvider>
    );
}
