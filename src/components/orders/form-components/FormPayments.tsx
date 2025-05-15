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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export default function FormPayments({
    form,
}: {
    form: UseFormReturn<z.infer<typeof addOrderSchema>>;
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-2xl font-semibold mb-8">Payment Details</h2>

            <div className="grid grid-cols-2 gap-10 items-center justify-between">
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
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center gap-6"
                                >
                                    {['Pay Later', 'Pay Now'].map((i, ind) => (
                                        <FormItem
                                            key={ind}
                                            className="flex items-center gap-x-2"
                                        >
                                            <FormControl>
                                                <RadioGroupItem value={i} />
                                            </FormControl>
                                            <FormLabel>{i}</FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem className="w-full space-y-4">
                            <FormLabel className="text-base font-medium">
                                Payment Method{' '}
                                {form.watch('paymentOption') === 'Pay Now' && (
                                    <Badge
                                        variant="outline"
                                        className="ml-2 text-red-500"
                                    >
                                        Required
                                    </Badge>
                                )}
                            </FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex items-center gap-6"
                                >
                                    {['Paypal', 'Card Payment'].map(
                                        (i, ind) => (
                                            <FormItem
                                                key={ind}
                                                className="flex items-center gap-x-2"
                                            >
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={i}
                                                        disabled={
                                                            form.watch(
                                                                'paymentOption'
                                                            ) === 'Pay Later'
                                                        }
                                                    />
                                                </FormControl>
                                                <FormLabel className={cn(form.watch(
                                                                'paymentOption'
                                                            ) === 'Pay Later' && "text-muted")}>{i}</FormLabel>
                                            </FormItem>
                                        )
                                    )}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
