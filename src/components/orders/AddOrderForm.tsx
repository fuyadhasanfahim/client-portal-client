'use client';

import { useState } from 'react';
import { useRef } from 'react';
import { Button } from '../ui/button';
import { DialogClose } from '../ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useGetServicesForUserQuery } from '@/redux/features/services/servicesApi';
import { Skeleton } from '../ui/skeleton';
import { Checkbox } from '../ui/checkbox';
import IService from '@/types/service.interface';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const addOrderSchema = z.object({
    name: z.string(),
});

export default function AddOrderForm({ userId }: { userId: string }) {
    const closeRef = useRef<HTMLButtonElement | null>(null);
    const [selectedService, setSelectedService] = useState<IService | null>(
        null
    );

    const form = useForm<z.infer<typeof addOrderSchema>>({
        resolver: zodResolver(addOrderSchema),
        defaultValues: {
            name: '',
        },
    });

    const { data: services, isLoading: isServiceLoading } =
        useGetServicesForUserQuery(userId);
    console.log(services);

    const onSubmit = async (data: z.infer<typeof addOrderSchema>) => {
        console.log(data);
    };

    const handleServiceClick = (service: IService) => {
        setSelectedService(service);
    };

    return (
        <section className="px-4 pb-4">
            <DialogClose asChild>
                <Button ref={closeRef} className="hidden" />
            </DialogClose>

            <Form {...form}>
                <form
                    className="space-y-6"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-1">
                                Services
                                <span className="text-destructive">*</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isServiceLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center space-x-4"
                                        >
                                            <Skeleton className="h-4 w-4 rounded" />
                                            <Skeleton className="h-4 w-40" />
                                        </div>
                                    ))}
                                </div>
                            ) : services.data.length === 0 ? (
                                <div className="text-muted-foreground text-sm">
                                    No services found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-6 items-center">
                                    {services?.data.map(
                                        (service: IService, index: number) => (
                                            <div
                                                key={index}
                                                className="flex flex-col gap-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`service-${index}`}
                                                        onClick={() =>
                                                            handleServiceClick(
                                                                service
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`service-${index}`}
                                                        className="cursor-pointer"
                                                        onClick={() =>
                                                            handleServiceClick(
                                                                service
                                                            )
                                                        }
                                                    >
                                                        {service.name}
                                                    </Label>
                                                </div>
                                                {selectedService?._id ===
                                                    service._id && (
                                                    <div className="ml-6 mt-1 space-y-2">
                                                        {service.accessibleTo ===
                                                            'Custom' && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-green-600 border-green-600"
                                                            >
                                                                Exclusive for
                                                                you
                                                            </Badge>
                                                        )}
                                                        {service.complexities &&
                                                            service.complexities
                                                                .length > 0 && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    <p className="font-medium">
                                                                        Complexity
                                                                        options:
                                                                    </p>
                                                                    <ul className="list-disc pl-5">
                                                                        {service.complexities.map(
                                                                            (
                                                                                complexity,
                                                                                idx
                                                                            ) => (
                                                                                <li
                                                                                    key={
                                                                                        idx
                                                                                    }
                                                                                >
                                                                                    <FormField
                                                                                        control={
                                                                                            form.control
                                                                                        }
                                                                                        name="name"
                                                                                        render={({
                                                                                            field,
                                                                                        }) => (
                                                                                            <FormItem className="space-y-3">
                                                                                                <FormLabel>
                                                                                                    Select
                                                                                                    Complexity
                                                                                                </FormLabel>
                                                                                                <FormControl>
                                                                                                    <RadioGroup
                                                                                                        onValueChange={
                                                                                                            field.onChange
                                                                                                        }
                                                                                                        defaultValue={
                                                                                                            field.value
                                                                                                        }
                                                                                                        className="flex flex-col space-y-1"
                                                                                                    >
                                                                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                                            <FormControl>
                                                                                                                <RadioGroupItem
                                                                                                                    value={`${complexity.label}: $ ${complexity.price}`}
                                                                                                                />
                                                                                                            </FormControl>
                                                                                                            <FormLabel className="font-normal">
                                                                                                                {
                                                                                                                    complexity.label
                                                                                                                }

                                                                                                                :
                                                                                                                $
                                                                                                                {
                                                                                                                    complexity.price
                                                                                                                }
                                                                                                            </FormLabel>
                                                                                                        </FormItem>
                                                                                                    </RadioGroup>
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                </li>
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </section>
    );
}
