'use client';

import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import Image from 'next/image';
import { Check, CreditCard, LockIcon, ShoppingCart } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { addOrderSchema } from '@/validations/add-order.schema';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type CardType = 'Visa' | 'Master Card' | 'American Express' | 'Paypal';

const StripeCardPreview = ({ type }: { type: CardType }) => {
    const cardTypes: Record<
        CardType,
        {
            brand: string;
            background: string;
            logo: string;
            lastFour: string;
        }
    > = {
        Visa: {
            brand: 'visa',
            background: 'bg-gradient-to-br from-blue-600 to-blue-800',
            logo: 'https://res.cloudinary.com/dny7zfbg9/image/upload/v1747132709/shxdtqpzjekql3pe077r.png',
            lastFour: '4242',
        },
        'Master Card': {
            brand: 'mastercard',
            background: 'bg-gradient-to-br from-red-600 to-red-800',
            logo: 'https://res.cloudinary.com/dny7zfbg9/image/upload/v1747132709/f4w0lmqsq5o8t1tm6qyq.png',
            lastFour: '5555',
        },
        'American Express': {
            brand: 'amex',
            background: 'bg-gradient-to-br from-green-600 to-green-800',
            logo: 'https://res.cloudinary.com/dny7zfbg9/image/upload/v1747132709/ysxhkgtcypyp9ef3nze7.png',
            lastFour: '3787',
        },
        Paypal: {
            brand: 'paypal',
            background: 'bg-gradient-to-br from-blue-400 to-blue-600',
            logo: 'https://res.cloudinary.com/dny7zfbg9/image/upload/v1747132709/azcad5awlf8hpdoucwtu.png',
            lastFour: '6011',
        },
    };

    const cardInfo = cardTypes[type] || {
        brand: 'unknown',
        background: 'bg-gradient-to-r from-gray-300 to-gray-400',
        logo: '',
        lastFour: '0000',
    };

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl text-white p-6 h-56 w-full',
                cardInfo.background
            )}
        >
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
                <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
            </div>

            <div className="absolute top-6 left-6 w-12 h-8 rounded-md bg-yellow-400 bg-opacity-80 flex items-center justify-center">
                <div className="w-8 h-4 bg-yellow-200 bg-opacity-60 rounded-sm"></div>
            </div>

            <div className="absolute top-6 right-6">
                <Image
                    src={cardInfo.logo}
                    alt={`${cardInfo.brand} logo`}
                    width={80}
                    height={48}
                    className="object-contain rounded-md"
                />
            </div>

            <div className="absolute inset-x-0 top-24 px-6">
                <div className="flex justify-start space-x-4 font-mono text-lg tracking-wider">
                    <div>••••</div>
                    <div>••••</div>
                    <div>••••</div>
                    <div>{cardInfo.lastFour}</div>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-6 px-6 flex justify-between text-xs uppercase opacity-80">
                <div className="flex flex-col">
                    <span className="text-xs opacity-75 mb-1">Card Holder</span>
                    <span className="font-medium">JOHN DOE</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-xs opacity-75 mb-1">Expires</span>
                    <span className="font-medium">05/28</span>
                </div>
            </div>
        </div>
    );
};

const PayPalPreview = () => (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl h-56 w-full flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute left-6 top-6 bg-blue-500 text-white p-2 rounded-full">
                <ShoppingCart size={24} />
            </div>
        </div>

        <Image
            src="https://res.cloudinary.com/dny7zfbg9/image/upload/v1747132709/azcad5awlf8hpdoucwtu.png"
            alt="PayPal logo"
            width={120}
            height={30}
            className="mb-4 rounded-md"
        />
        <div className="text-blue-600 text-lg font-medium">
            Fast, secure checkout
        </div>
        <div className="mt-3 text-gray-500 text-sm flex items-center">
            <LockIcon size={14} className="mr-2" />
            ••••@email.com
        </div>
        <div className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-medium">
            Connected & Ready
        </div>
    </div>
);

const PaymentOption = ({
    icon,
    title,
    description,
    selected,
    onClick,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}) => (
    <div
        className={`border rounded-xl p-4 flex items-center cursor-pointer transition-all ${
            selected
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={onClick}
    >
        <div
            className={`p-3 rounded-full ${
                selected
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
            } mr-4`}
        >
            {icon}
        </div>
        <div className="flex-grow">
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div
            className={`w-6 h-6 rounded-full border ${
                selected ? 'border-green-500 bg-green-500' : 'border-gray-300'
            } flex items-center justify-center`}
        >
            {selected && <Check size={14} className="text-white" />}
        </div>
    </div>
);

export default function FormPayments({
    form,
}: {
    form: UseFormReturn<z.infer<typeof addOrderSchema>>;
}) {
    const values = form.watch();
    const [stripeLoaded, setStripeLoaded] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setStripeLoaded(true), 400);
        return () => clearTimeout(timeout);
    }, []);

    const renderPreview = () => {
        if (!values.paymentMethod) return null;
        return values.paymentMethod === 'Paypal' ? (
            <PayPalPreview />
        ) : (
            <StripeCardPreview type={values.paymentMethod as CardType} />
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-2xl font-semibold mb-8">Payment Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7 space-y-8">
                    <div className="w-full">
                        <div className="grid gap-6 w-full">
                            <FormField
                                control={form.control}
                                name="paymentOption"
                                render={({ field }) => (
                                    <FormItem className="w-full space-y-4">
                                        <FormLabel className="text-base font-medium">
                                            Payment Option{' '}
                                            <Badge
                                                variant="outline"
                                                className="ml-2 text-red-500"
                                            >
                                                Required
                                            </Badge>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="space-y-3">
                                                <PaymentOption
                                                    icon={
                                                        <CreditCard size={24} />
                                                    }
                                                    title="Pay Now"
                                                    description="Complete your purchase immediately"
                                                    selected={
                                                        field.value === 'card'
                                                    }
                                                    onClick={() =>
                                                        field.onChange('card')
                                                    }
                                                />
                                                <PaymentOption
                                                    icon={
                                                        <ShoppingCart
                                                            size={24}
                                                        />
                                                    }
                                                    title="Pay Later"
                                                    description="Defer payment until delivery"
                                                    selected={
                                                        field.value ===
                                                        'paylater'
                                                    }
                                                    onClick={() =>
                                                        field.onChange(
                                                            'paylater'
                                                        )
                                                    }
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {values.paymentOption === 'card' && (
                                <div className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="paymentMethod"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel className="text-base font-medium">
                                                    Payment Method{' '}
                                                    <Badge
                                                        variant="outline"
                                                        className="ml-2 text-red-500"
                                                    >
                                                        Required
                                                    </Badge>
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="h-12">
                                                            <SelectValue placeholder="Select payment method" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[
                                                                'Paypal',
                                                                'Visa',
                                                                'Master Card',
                                                                'American Express',
                                                            ].map(
                                                                (
                                                                    method,
                                                                    idx
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            method
                                                                        }
                                                                    >
                                                                        {method}
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {values.paymentMethod && (
                                        <div className="space-y-6">
                                            {renderPreview()}
                                            {stripeLoaded &&
                                                values.paymentMethod !==
                                                    'Paypal' && (
                                                    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                                                        <h3 className="text-base font-medium mb-4 flex items-center">
                                                            <LockIcon
                                                                size={16}
                                                                className="mr-2 text-green-600"
                                                            />
                                                            Enter Card Details
                                                        </h3>
                                                        <div className="space-y-4">
                                                            <div className="h-12 border rounded-lg px-4 flex items-center text-gray-500 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                                                                Card number
                                                            </div>
                                                            <div className="flex space-x-4">
                                                                <div className="h-12 border rounded-lg px-4 flex items-center text-gray-500 w-1/2 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                                                                    MM / YY
                                                                </div>
                                                                <div className="h-12 border rounded-lg px-4 flex items-center text-gray-500 w-1/2 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                                                                    CVC
                                                                </div>
                                                            </div>
                                                            <div className="h-12 border rounded-lg px-4 flex items-center text-gray-500 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                                                                Cardholder name
                                                            </div>
                                                        </div>
                                                        <div className="mt-6 text-sm text-gray-500 flex items-center p-3 rounded-lg">
                                                            <LockIcon
                                                                size={16}
                                                                className="mr-2 text-green-600"
                                                            />
                                                            All payment
                                                            information is
                                                            securely encrypted
                                                            and protected
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {values.paymentOption === 'card' &&
                                values.paymentMethod && (
                                    <div>
                                        <Button
                                            type="button"
                                            className="w-full h-12 text-base font-medium"
                                            onClick={form.handleSubmit(
                                                (data) => {
                                                    console.log(
                                                        'Final Payment Submission:',
                                                        data
                                                    );
                                                }
                                            )}
                                        >
                                            Complete Payment
                                        </Button>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                <Separator
                    orientation="vertical"
                    className="hidden md:block mx-auto h-auto"
                />

                <div className="md:col-span-4">
                    <div className="bg-accent rounded-xl p-6 sticky top-6">
                        <h3 className="text-lg font-semibold mb-4 pb-3 border-b">
                            Order Summary
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Images:</span>
                                <span className="font-medium">
                                    {values.numberOfImages || '0'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Return Format:
                                </span>
                                <span className="font-medium">
                                    {values.returnFormate || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold mt-4 pt-3 border-t">
                                <span>Total Price:</span>
                                <span>
                                    ${values.totalPrice?.toFixed(2) || '0.00'}
                                </span>
                            </div>

                            <div className="pt-4 mt-4 border-t">
                                <h4 className="font-medium mb-2">
                                    Instructions
                                </h4>
                                <p className="text-sm text-gray-600 italic">
                                    {values.instructions ||
                                        'No special instructions'}
                                </p>
                            </div>

                            <div className="pt-4 mt-4 border-t">
                                <h4 className="font-medium mb-2">
                                    Payment Details
                                </h4>
                                <div className="text-sm space-y-2">
                                    <div className="flex items-center">
                                        <span className="text-gray-600 w-32">
                                            Option:
                                        </span>
                                        <Badge
                                            variant={
                                                values.paymentOption
                                                    ? 'outline'
                                                    : 'secondary'
                                            }
                                            className="font-normal"
                                        >
                                            {values.paymentOption === 'card'
                                                ? 'Pay Now'
                                                : values.paymentOption ===
                                                  'paylater'
                                                ? 'Pay Later'
                                                : '-'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-600 w-32">
                                            Method:
                                        </span>
                                        <Badge
                                            variant={
                                                values.paymentMethod
                                                    ? 'outline'
                                                    : 'secondary'
                                            }
                                            className="font-normal"
                                        >
                                            {values.paymentMethod || '-'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
