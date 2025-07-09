'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
    Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ApiError from '@/components/shared/ApiError';
import SaveCardForm from './SaveCardForm';
import { useCreateSetupIntentMutation, useNewOrderCheckoutMutation } from '@/redux/features/stripe/stripeApi';

const paymentOptions = [
    {
        value: 'pay-later',
        title: 'Pay Later (Monthly)',
        description:
            'Spread your payments across months. Ideal for businesses and long-term projects.',
    },
    {
        value: 'pay-now',
        title: 'Pay Now',
        description:
            'Pay upfront and get priority processing for faster delivery.',
    },
];

const paymentMethods = [
    {
        value: 'card-payment',
        title: 'Card Payment',
        description:
            'Pay upfront and get priority processing for faster delivery.',
    },
];

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function RootNewOrderPayment({
    orderID,
    userID,
}: {
    orderID: string;
    userID: string;
}) {
    const [paymentOption, setPaymentOption] = useState<
        'pay-now' | 'pay-later' | ''
    >('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [customerID, setCustomerID] = useState('');

    const [newOrderCheckout] = useNewOrderCheckoutMutation();
    const [createSetupIntent] = useCreateSetupIntentMutation();

    if (paymentOption === 'pay-now') {
        newOrderCheckout({
            orderID,
            paymentOption,
            paymentMethod,
        }).unwrap();
    }

    useEffect(() => {
        const createSession = async () => {
            if (
                paymentOption === 'pay-now' &&
                paymentMethod === 'card-payment'
            ) {
                const res = await newOrderCheckout({
                    orderID,
                    paymentOption,
                    paymentMethod,
                });

                if (res.data && res.data.success) {
                    setClientSecret(res.data.data!);
                }
            }
        };
        createSession();
    }, [paymentOption, paymentMethod, orderID]);

    useEffect(() => {
        if (paymentOption === 'pay-later') {
            const fetchSetupIntent = async () => {
                if (paymentOption === 'pay-later' && userID) {
                    try {
                        const res = await createSetupIntent({
                            userID,
                            orderID,
                        });

                        if (res.data && res.data.success) {
                            setClientSecret(res.data.data.client_secret!);
                            setCustomerID(res.data.data.customer_id!);
                        }
                    } catch (error) {
                        ApiError(error);
                    }
                }
            };

            fetchSetupIntent();
        }
    }, [paymentOption, userID, orderID]);

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
                                setPaymentOption(
                                    val as 'pay-now' | 'pay-later'
                                );
                                if (val === 'pay-later') setPaymentMethod('');
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
                            disabled={paymentOption === 'pay-later'}
                        >
                            {paymentMethods.map(
                                ({ value, title, description }) => (
                                    <Card
                                        key={value}
                                        className={`border-2 transition-all ${
                                            paymentOption === 'pay-later'
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
                                                            'pay-later' &&
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
            </Card>

            <Card className="min-h-[600px]">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Complete Your Payment
                    </CardTitle>
                    <CardDescription>
                        You’ll be redirected here after securely submitting
                        payment.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {paymentOption === 'pay-now' &&
                        paymentMethod === 'card-payment' &&
                        clientSecret && (
                            <EmbeddedCheckoutProvider
                                stripe={stripePromise}
                                options={{ clientSecret }}
                            >
                                <EmbeddedCheckout className="w-full" />
                            </EmbeddedCheckoutProvider>
                        )}

                    {paymentOption === 'pay-later' && clientSecret ? (
                        <Elements
                            stripe={stripePromise}
                            options={{ clientSecret }}
                        >
                            <SaveCardForm
                                userID={userID!}
                                orderID={orderID}
                                customerID={customerID}
                            />
                        </Elements>
                    ) : paymentOption === 'pay-later' ? (
                        <p>Loading payment form...</p>
                    ) : null}
                </CardContent>
            </Card>
        </section>
    );
}
