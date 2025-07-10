'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
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
import {
    useCreateSetupIntentMutation,
    useNewOrderCheckoutMutation,
} from '@/redux/features/stripe/stripeApi';
import { Loader2, CreditCard, Calendar } from 'lucide-react';
import { useGetOrderByIDQuery } from '@/redux/features/orders/ordersApi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const paymentOptions = [
    {
        value: 'pay-later',
        title: 'Pay Later (Monthly)',
        description: 'Split your payments monthly.',
        icon: <Calendar className="w-5 h-5" />,
    },
    {
        value: 'pay-now',
        title: 'Pay Now',
        description: 'One-time full payment.',
        icon: <CreditCard className="w-5 h-5" />,
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
    const { data, isLoading: isOrderLoading } = useGetOrderByIDQuery(orderID);
    const router = useRouter();

    if (!isOrderLoading && data.data.paymentStatus === 'paid') {
        toast.error(
            "The order's payment status is paid. Redirecting to orders page..."
        );

        setTimeout(() => {
            router.push('/orders');
        }, 3000);
    }

    const [paymentOption, setPaymentOption] = useState<
        '' | 'pay-now' | 'pay-later'
    >('');
    const [clientSecret, setClientSecret] = useState('');
    const [customerID, setCustomerID] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [newOrderCheckout] = useNewOrderCheckoutMutation();
    const [createSetupIntent] = useCreateSetupIntentMutation();

    useEffect(() => {
        const fetchPaymentSession = async () => {
            if (!paymentOption) return;

            setIsLoading(true);
            try {
                if (paymentOption === 'pay-now') {
                    const res = await newOrderCheckout({
                        orderID,
                        paymentOption,
                        paymentMethod: 'card-payment',
                    }).unwrap();

                    if (res?.success) {
                        setClientSecret(res.data);
                    }
                } else if (paymentOption === 'pay-later') {
                    const res = await createSetupIntent({
                        userID,
                        orderID,
                    }).unwrap();

                    if (res?.success) {
                        setClientSecret(res.data.client_secret);
                        setCustomerID(res.data.customer_id);
                    }
                }
            } catch (err) {
                ApiError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaymentSession();
    }, [paymentOption, orderID, userID]);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Select Payment Option
                    </CardTitle>
                    <CardDescription>
                        Choose a payment method that fits your needs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={paymentOption}
                        onValueChange={(val) =>
                            setPaymentOption(val as 'pay-now' | 'pay-later')
                        }
                        className="grid gap-4 sm:grid-cols-2"
                    >
                        {paymentOptions.map(
                            ({ value, title, description, icon }) => (
                                <Card
                                    key={value}
                                    className={cn(
                                        'border-2 transition-all rounded-xl p-4 cursor-pointer',
                                        paymentOption === value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted hover:border-primary/50'
                                    )}
                                    onClick={() =>
                                        setPaymentOption(
                                            value as 'pay-now' | 'pay-later'
                                        )
                                    }
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 text-primary p-3 rounded-md">
                                            {icon}
                                        </div>
                                        <div>
                                            <p className="font-medium text-base">
                                                {title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )
                        )}
                    </RadioGroup>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {paymentOption === 'pay-now'
                            ? 'Complete Your Payment'
                            : paymentOption === 'pay-later'
                            ? 'Secure Your Payment'
                            : 'Choose a Payment Option'}
                    </CardTitle>
                    <CardDescription>
                        {paymentOption
                            ? 'Securely submit your payment using Stripe'
                            : 'Select an option to continue'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center min-h-[200px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <p>Preparing payment form...</p>
                        </div>
                    ) : paymentOption === 'pay-now' && clientSecret ? (
                        <EmbeddedCheckoutProvider
                            stripe={stripePromise}
                            options={{ clientSecret }}
                        >
                            <EmbeddedCheckout className="w-full" />
                        </EmbeddedCheckoutProvider>
                    ) : paymentOption === 'pay-later' && clientSecret ? (
                        <Elements
                            stripe={stripePromise}
                            options={{ clientSecret }}
                        >
                            <SaveCardForm
                                userID={userID}
                                orderID={orderID}
                                customerID={customerID}
                            />
                        </Elements>
                    ) : (
                        <div className="text-center p-6 text-muted-foreground space-y-2">
                            <CreditCard className="w-10 h-10 mx-auto" />
                            <p className="text-lg font-semibold">
                                Select a payment method to begin
                            </p>
                            <p className="text-sm">
                                You’ll be guided through a secure process
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
