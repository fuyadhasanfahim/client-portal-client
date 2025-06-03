'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { use, useEffect, useState } from 'react';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useNewOrderMutation } from '@/redux/features/orders/ordersApi';
import ApiError from '@/components/shared/ApiError';
import { useRouter } from 'next/navigation';

const paymentOptions = [
    {
        value: 'Pay Later',
        title: 'Pay Later (Monthly)',
        description:
            'Spread your payments across months. Ideal for businesses and long-term projects.',
    },
    {
        value: 'Pay Now',
        title: 'Pay Now',
        description:
            'Pay upfront and get priority processing for faster delivery.',
    },
];

const paymentMethods = [
    {
        value: 'Card Payment',
        title: 'Card Payment',
        description:
            'Pay upfront and get priority processing for faster delivery.',
    },
];

export default function RootNewOrderPayment({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [paymentOption, setPaymentOption] = useState('Pay Later');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        const createSession = async () => {
            if (
                paymentOption === 'Pay Now' &&
                paymentMethod === 'Card Payment'
            ) {
                const res = await fetch('/api/stripe/new-order-checkout', {
                    method: 'POST',
                    body: JSON.stringify({
                        orderID: id,
                        paymentOption,
                        paymentMethod,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                });

                const data = await res.json();
                setClientSecret(data.client_secret);
            }
        };

        createSession();
    }, [paymentOption, paymentMethod, id]);

    const stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );

    const [newOrder, { isLoading }] = useNewOrderMutation();

    const router = useRouter();

    const handlePayment = async () => {
        try {
            const response = await newOrder({
                data: {
                    orderID: id,
                    paymentOption,
                },
            });

            if (response?.data?.success) {
                router.push(`/orders`);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <section className="grid grid-cols-2 gap-6 items-start">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Choose a Payment Option
                    </CardTitle>
                    <CardDescription>
                        Select your preferred method to complete the order.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className={'space-y-2'}>
                        <h3 className="text-lg font-semibold">
                            Payment Options
                        </h3>

                        <RadioGroup
                            value={paymentOption}
                            onValueChange={(val) => {
                                setPaymentOption(val);
                                if (val === 'Pay Later') setPaymentMethod('');
                            }}
                            className="grid gap-4"
                        >
                            {paymentOptions.map(
                                ({ value, title, description }) => (
                                    <Card
                                        key={value}
                                        className="border-2 border-muted hover:border-primary transition-all"
                                    >
                                        <CardContent className="flex items-center gap-4">
                                            <RadioGroupItem
                                                value={value}
                                                id={value}
                                                className="size-7"
                                            />
                                            <div>
                                                <Label
                                                    htmlFor={value}
                                                    className="text-base font-medium cursor-pointer"
                                                >
                                                    {title}
                                                </Label>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            )}
                        </RadioGroup>
                    </div>

                    <div className={'space-y-2'}>
                        <h3 className="text-lg font-semibold">
                            Payment Methods
                        </h3>

                        <RadioGroup
                            value={paymentMethod}
                            onValueChange={setPaymentMethod}
                            className="grid gap-4"
                            disabled={paymentOption === 'Pay Later'}
                        >
                            {paymentMethods.map(
                                ({ value, title, description }) => (
                                    <Card
                                        key={value}
                                        className={`border-2 transition-all ${
                                            paymentOption === 'Pay Later'
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:border-primary border-muted'
                                        }`}
                                    >
                                        <CardContent className="flex items-center gap-4">
                                            <RadioGroupItem
                                                value={value}
                                                id={value}
                                                className="size-7"
                                            />
                                            <div>
                                                <Label
                                                    htmlFor={value}
                                                    className={cn(
                                                        'text-base font-medium cursor-pointer',
                                                        paymentOption ===
                                                            'Pay Later' &&
                                                            'cursor-not-allowed'
                                                    )}
                                                >
                                                    {title}
                                                </Label>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            )}
                        </RadioGroup>
                    </div>
                </CardContent>
                {paymentOption === 'Pay Later' && (
                    <CardFooter>
                        <Button
                            className="w-full"
                            disabled={isLoading}
                            onClick={handlePayment}
                        >
                            Place Order
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {paymentOption === 'Pay Now' &&
                paymentMethod === 'Card Payment' && (
                    <Card className="min-h-[600px]">
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Complete Your Payment
                            </CardTitle>
                            <CardDescription>
                                You’ll be redirected here after securely
                                submitting payment through Stripe.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {clientSecret ? (
                                <EmbeddedCheckoutProvider
                                    stripe={stripePromise}
                                    options={{ clientSecret }}
                                >
                                    <EmbeddedCheckout className="w-full" />
                                </EmbeddedCheckoutProvider>
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    Loading payment session...
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
        </section>
    );
}
