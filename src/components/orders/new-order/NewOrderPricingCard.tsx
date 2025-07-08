'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { IOrder } from '@/types/order.interface';
import Link from 'next/link';

function formatCurrency(value: number) {
    return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function NewOrderPricingCard({ order }: { order: IOrder }) {
    const { details, services, orderID } = order;

    let total = 0;

    const breakdown = services.map((service) => {
        const lineItems: { label: string; formula: string; amount: number }[] =
            [];

        if (service.price) {
            const amount = service.price * (details?.images || 0);
            total += amount;
            lineItems.push({
                label: `${service.name} (flat price)`,
                formula: `${formatCurrency(service.price)} × ${
                    details?.images
                }`,
                amount,
            });
        }

        if (service.complexity) {
            const amount = service.complexity.price * (details?.images || 0);
            total += amount;
            lineItems.push({
                label: `${service.name} → ${service.complexity.name}`,
                formula: `${formatCurrency(service.complexity.price)} × ${
                    details?.images
                }`,
                amount,
            });
        }

        if (service.types?.length) {
            service.types.forEach((type) => {
                if (type.complexity) {
                    const amount =
                        type.complexity.price * (details?.images || 0);
                    total += amount;
                    lineItems.push({
                        label: `${service.name} → ${type.name} → ${type.complexity.name}`,
                        formula: `${formatCurrency(type.complexity.price)} × ${
                            details?.images
                        }`,
                        amount,
                    });
                }
            });
        }

        if (service.options?.length) {
            const optionFee = 0.25;
            const amount =
                service.options.length * optionFee * (details?.images || 0);
            total += amount;
            lineItems.push({
                label: `${service.name} → ${service.options.length} option(s)`,
                formula: `$0.25 × ${service.options.length} × ${details?.images}`,
                amount,
            });
        }

        return { service: service.name, lineItems };
    });

    let resizingFee = 0;
    if (details?.imageResizing) {
        resizingFee = 0.25 * (details?.images || 0);
        total += resizingFee;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Pricing Breakdown</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Based on selected services and image count (
                    {details?.images})
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {breakdown.map((entry, index) => (
                    <div key={index} className="space-y-1">
                        <h4 className="text-base font-semibold text-primary">
                            {entry.service}
                        </h4>
                        <ul className="ml-4 space-y-2 text-sm text-muted-foreground">
                            {entry.lineItems.map((item, i) => (
                                <li
                                    key={i}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                                >
                                    <span>{item.label}</span>
                                    <div className="flex flex-col sm:items-end text-right">
                                        <span className="text-xs italic">
                                            {item.formula}
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {resizingFee > 0 && (
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-muted-foreground border-t pt-2">
                        <span>Image Resizing</span>
                        <div className="text-right">
                            <span className="text-xs italic">
                                $0.25 × {details?.images}
                            </span>
                            <div className="text-base font-medium text-foreground">
                                {formatCurrency(resizingFee)}
                            </div>
                        </div>
                    </div>
                )}

                <div className="border-t pt-4 flex justify-between font-semibold text-lg text-foreground">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href={`/orders/new-order/payment/${orderID}`}>
                        Proceed to Payment
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
