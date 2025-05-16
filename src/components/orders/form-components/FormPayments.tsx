'use client';

import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';
import { addOrderSchema } from '@/validations/add-order.schema';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    IconCreditCard,
    IconWallet,
    IconBrandPaypal,
    IconBrandMastercard,
} from '@tabler/icons-react';
import {
    EmbeddedCheckout,
    EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

export default function FormPayments({
    form,
}: {
    form: UseFormReturn<z.infer<typeof addOrderSchema>>;
}) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const shouldShowCheckout =
        form.watch('paymentOption') === 'Pay Now' &&
        form.watch('paymentMethod') === 'Card Payment';

    const stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );

    useEffect(() => {
        if (shouldShowCheckout && !clientSecret) {
            const fetchClientSecret = async () => {
                const orderData = form.getValues();

                const response = await fetch(
                    '/api/stripe/create-checkout-session',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData),
                    }
                );

                const data = await response.json();
                setClientSecret(data.client_secret);
            };

            fetchClientSecret();
        }
    }, [clientSecret, form, shouldShowCheckout]);

    return (
        <div className="pb-8">
            <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b pb-4 flex items-center">
                <IconWallet className="mr-3 h-6 w-6 text-green-600" />
                Payment Details
            </h2>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                    <FormField
                        control={form.control}
                        name="paymentOption"
                        render={({ field }) => (
                            <div>
                                <FormItem className="w-full space-y-5">
                                    <FormLabel className="text-lg font-semibold text-gray-800 flex items-center">
                                        Payment Option
                                        {!field.value && (
                                            <Badge
                                                variant="outline"
                                                className="ml-2 bg-red-50 text-red-500 border-red-200 font-medium"
                                            >
                                                Required
                                            </Badge>
                                        )}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col gap-4">
                                            {['Pay Later', 'Pay Now'].map(
                                                (option, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            'relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 flex items-center flex-1',
                                                            field.value ===
                                                                option
                                                                ? 'border-green-500 bg-green-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        )}
                                                        onClick={() =>
                                                            field.onChange(
                                                                option
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={cn(
                                                                'w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center',
                                                                field.value ===
                                                                    option
                                                                    ? 'border-green-500'
                                                                    : 'border-gray-300'
                                                            )}
                                                        >
                                                            {field.value ===
                                                                option && (
                                                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span
                                                                className={cn(
                                                                    'font-medium text-lg',
                                                                    field.value ===
                                                                        option
                                                                        ? 'text-green-700'
                                                                        : 'text-gray-700'
                                                                )}
                                                            >
                                                                {option}
                                                            </span>
                                                            {option ===
                                                                'Pay Later' && (
                                                                <span className="text-sm text-gray-500">
                                                                    Monthly
                                                                    installments
                                                                    available
                                                                </span>
                                                            )}
                                                            {option ===
                                                                'Pay Now' && (
                                                                <span className="text-sm text-gray-500">
                                                                    Secure
                                                                    payment
                                                                    processed
                                                                    immediately
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </div>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <div
                                className={cn(
                                    'transition-all duration-300',
                                    form.watch('paymentOption') !== 'Pay Now'
                                        ? 'opacity-50 pointer-events-none filter blur-[0.5px]'
                                        : 'opacity-100'
                                )}
                            >
                                <FormItem className="w-full space-y-5">
                                    <FormLabel className="text-lg font-semibold text-gray-800 flex items-center">
                                        <IconCreditCard className="mr-2 h-5 w-5 text-green-600" />
                                        Payment Method
                                        {form.watch('paymentOption') ===
                                            'Pay Now' &&
                                            !field.value && (
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2 bg-red-50 text-red-500 border-red-200 font-medium"
                                                >
                                                    Required
                                                </Badge>
                                            )}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col gap-4">
                                            <div
                                                className={cn(
                                                    'relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-200',
                                                    field.value === 'Paypal' &&
                                                        form.watch(
                                                            'paymentOption'
                                                        ) === 'Pay Now'
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 hover:border-gray-300',
                                                    form.watch(
                                                        'paymentOption'
                                                    ) !== 'Pay Now' &&
                                                        'cursor-not-allowed'
                                                )}
                                                onClick={() => {
                                                    if (
                                                        form.watch(
                                                            'paymentOption'
                                                        ) === 'Pay Now'
                                                    ) {
                                                        field.onChange(
                                                            'Paypal'
                                                        );
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <div
                                                        className={cn(
                                                            'w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center',
                                                            field.value ===
                                                                'Paypal' &&
                                                                form.watch(
                                                                    'paymentOption'
                                                                ) === 'Pay Now'
                                                                ? 'border-green-500'
                                                                : 'border-gray-300'
                                                        )}
                                                    >
                                                        {field.value ===
                                                            'Paypal' &&
                                                            form.watch(
                                                                'paymentOption'
                                                            ) === 'Pay Now' && (
                                                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                                            )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span
                                                            className={cn(
                                                                'font-medium text-lg',
                                                                field.value ===
                                                                    'Paypal' &&
                                                                    form.watch(
                                                                        'paymentOption'
                                                                    ) ===
                                                                        'Pay Now'
                                                                    ? 'text-green-700'
                                                                    : 'text-gray-700'
                                                            )}
                                                        >
                                                            <span className="flex items-center">
                                                                PayPal
                                                                <IconBrandPaypal className="ml-2 h-5 w-5 text-blue-600" />
                                                            </span>
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            Fast and secure
                                                            online payments
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={cn(
                                                    'relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-200',
                                                    field.value ===
                                                        'Card Payment' &&
                                                        form.watch(
                                                            'paymentOption'
                                                        ) === 'Pay Now'
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 hover:border-gray-300',
                                                    form.watch(
                                                        'paymentOption'
                                                    ) !== 'Pay Now' &&
                                                        'cursor-not-allowed'
                                                )}
                                                onClick={() => {
                                                    if (
                                                        form.watch(
                                                            'paymentOption'
                                                        ) === 'Pay Now'
                                                    ) {
                                                        field.onChange(
                                                            'Card Payment'
                                                        );
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <div
                                                        className={cn(
                                                            'w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center',
                                                            field.value ===
                                                                'Card Payment' &&
                                                                form.watch(
                                                                    'paymentOption'
                                                                ) === 'Pay Now'
                                                                ? 'border-green-500'
                                                                : 'border-gray-300'
                                                        )}
                                                    >
                                                        {field.value ===
                                                            'Card Payment' &&
                                                            form.watch(
                                                                'paymentOption'
                                                            ) === 'Pay Now' && (
                                                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                                            )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span
                                                            className={cn(
                                                                'font-medium text-lg',
                                                                field.value ===
                                                                    'Card Payment' &&
                                                                    form.watch(
                                                                        'paymentOption'
                                                                    ) ===
                                                                        'Pay Now'
                                                                    ? 'text-green-700'
                                                                    : 'text-gray-700'
                                                            )}
                                                        >
                                                            <span className="flex items-center">
                                                                Credit/Debit
                                                                Card
                                                                <IconBrandMastercard className="ml-2 h-5 w-5 text-orange-600" />
                                                            </span>
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            All major cards
                                                            accepted
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </div>
                        )}
                    />
                </div>

                {shouldShowCheckout && (
                    <div className="w-full rounded-xl border-2 border-green-100 overflow-hidden">
                        <div className="bg-green-50 p-4 border-b border-green-100">
                            <h3 className="text-lg font-medium text-green-800 flex items-center">
                                <IconCreditCard className="mr-2 h-5 w-5" />
                                Complete Payment
                            </h3>
                        </div>
                        <div className="p-2">
                            <EmbeddedCheckoutProvider
                                stripe={stripePromise}
                                options={{ clientSecret }}
                            >
                                <EmbeddedCheckout />
                            </EmbeddedCheckoutProvider>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
