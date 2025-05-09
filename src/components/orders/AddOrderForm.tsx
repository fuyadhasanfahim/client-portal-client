'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useGetServicesForUserQuery } from '@/redux/features/services/servicesApi';
import IService from '@/types/service.interface';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const addOrderSchema = z.object({
    services: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(),
                price: z.number().optional(),
                complexity: z
                    .object({
                        label: z.string(),
                        price: z.number(),
                    })
                    .optional(),
                colorCode: z.string().optional(),
                width: z.coerce.number().optional(),
                height: z.coerce.number().optional(),
            })
        )
        .min(1, 'Please select at least one service'),
    userId: z.string().nonempty(),
    OrderCreationDate: z.date(),
    driveLink: z.string().nonempty(),
    numberOfImages: z.number().nonnegative(),
    pricePerImage: z.number().nonnegative(),
    returnFormate: z.string().nonempty(),
    orderInstructions: z.string().nonempty(),
    images: z.string().optional(),
    paymentStatus: z.string().nonempty(),
    paymentMethod: z.string().nonempty(),
    totalPrice: z.number().nonnegative(),
});

type FormValues = z.infer<typeof addOrderSchema>;

export default function ServiceSelectForm({ userId }: { userId: string }) {
    const { data: servicesData, isLoading: isServiceLoading } =
        useGetServicesForUserQuery(userId);

    const form = useForm<FormValues>({
        resolver: zodResolver(addOrderSchema),
        defaultValues: { services: [] },
    });

    const selectedServices = form.watch('services');

    const toggleService = (service: IService) => {
        const index = selectedServices.findIndex((s) => s.id === service._id);
        if (index >= 0) {
            const updated = [...selectedServices];
            updated.splice(index, 1);
            form.setValue('services', updated);
        } else {
            const newService = {
                id: service._id!,
                name: service.name,
                ...(service.complexities?.length
                    ? { complexity: undefined }
                    : { price: service.price ?? 0 }),
            };
            form.setValue('services', [...selectedServices, newService]);
        }
    };

    const updateComplexity = (serviceId: string, value: string) => {
        const [label, priceStr] = value.split(':$');
        const updated = selectedServices.map((s) =>
            s.id === serviceId
                ? {
                      ...s,
                      complexity: {
                          label: label.trim(),
                          price: parseFloat(priceStr),
                      },
                      price: undefined,
                  }
                : s
        );
        form.setValue('services', updated);
    };

    const isSelected = (id: string) =>
        selectedServices.some((s) => s.id === id);

    const selectedComplexity = (id: string) => {
        const service = selectedServices.find((s) => s.id === id);
        return service?.complexity
            ? `${service.complexity.label}:$${service.complexity.price}`
            : '';
    };

    const onSubmit = (data: FormValues) => {
        if (data.services) {
            const invalidComplexities = data.services.filter(
                (s) =>
                    !s.complexity &&
                    servicesData?.data?.find(
                        (svc: IService) => svc._id === s.id
                    )?.complexities?.length > 0
            );

            if (invalidComplexities.length > 0) {
                toast.error(
                    'Please select complexity for all services that require it.'
                );
                return;
            }

            const colorCorrection = data.services.find(
                (s) => s.name === 'Color Correction'
            );
            if (colorCorrection && !colorCorrection.colorCode?.trim()) {
                toast.error('Please enter a color code for Color Correction.');
                return;
            }

            const imageResize = data.services.find(
                (s) => s.name === 'Images Resizing'
            );
            if (imageResize && (!imageResize.width || !imageResize.height)) {
                toast.error(
                    'Please enter both width and height for Images Resizing in pixels.'
                );
                return;
            }
        }

        console.log(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle>
                            Select Services{' '}
                            <span className="text-destructive">*</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-6 items-start">
                        {isServiceLoading ? (
                            [...Array(10)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-[68px] w-full rounded-2xl"
                                />
                            ))
                        ) : !servicesData?.data.length ? (
                            <p className="text-sm text-muted-foreground">
                                No services found.
                            </p>
                        ) : (
                            servicesData.data.map(
                                (service: IService, index: number) => (
                                    <Card key={index} className="shadow-none">
                                        <CardContent>
                                            <FormField
                                                name="services"
                                                render={() => (
                                                    <FormItem>
                                                        <div className="flex items-center space-x-2">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={isSelected(
                                                                        service._id!
                                                                    )}
                                                                    onCheckedChange={() =>
                                                                        toggleService(
                                                                            service
                                                                        )
                                                                    }
                                                                    className="cursor-pointer"
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-medium cursor-pointer">
                                                                {service.name}
                                                            </FormLabel>
                                                            {(service.price ??
                                                                0) > 0 ? (
                                                                <Badge
                                                                    variant={
                                                                        'outline'
                                                                    }
                                                                    className="bg-green-50 text-green-800 border-green-400"
                                                                >
                                                                    $
                                                                    {
                                                                        service.price
                                                                    }
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    variant={
                                                                        'outline'
                                                                    }
                                                                    className="bg-green-50 text-green-800 border-green-400"
                                                                >
                                                                    Select
                                                                    Complexity
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {isSelected(
                                                            service._id!
                                                        ) &&
                                                            (service
                                                                .complexities
                                                                ?.length ?? 0) >
                                                                0 && (
                                                                <div className="pl-6 pt-2">
                                                                    <FormLabel className="text-sm">
                                                                        Select
                                                                        Complexity:{' '}
                                                                        {service.accessList?.includes(
                                                                            userId
                                                                        ) && (
                                                                            <Badge
                                                                                variant={
                                                                                    'outline'
                                                                                }
                                                                                className="bg-green-50 text-green-800 border-green-400"
                                                                            >
                                                                                <Star className="fill-primary" />
                                                                                Exclusive
                                                                            </Badge>
                                                                        )}
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <RadioGroup
                                                                            value={selectedComplexity(
                                                                                service._id!
                                                                            )}
                                                                            onValueChange={(
                                                                                val
                                                                            ) =>
                                                                                updateComplexity(
                                                                                    service._id!,
                                                                                    val
                                                                                )
                                                                            }
                                                                            className="space-y-2 mt-2"
                                                                        >
                                                                            {service.complexities?.map(
                                                                                (
                                                                                    c
                                                                                ) => (
                                                                                    <FormItem
                                                                                        key={
                                                                                            c.label
                                                                                        }
                                                                                        className="flex items-center space-x-2"
                                                                                    >
                                                                                        <FormControl>
                                                                                            <RadioGroupItem
                                                                                                value={`${c.label}:$${c.price}`}
                                                                                            />
                                                                                        </FormControl>
                                                                                        <FormLabel>
                                                                                            {
                                                                                                c.label
                                                                                            }{' '}
                                                                                            -
                                                                                            $
                                                                                            {
                                                                                                c.price
                                                                                            }
                                                                                        </FormLabel>
                                                                                    </FormItem>
                                                                                )
                                                                            )}
                                                                        </RadioGroup>
                                                                    </FormControl>
                                                                </div>
                                                            )}

                                                        {isSelected(
                                                            service._id!
                                                        ) &&
                                                            service.name ===
                                                                'Color Correction' && (
                                                                <div className="flex items-center gap-2 mt-4">
                                                                    <Label
                                                                        htmlFor="colorCode"
                                                                        className="text-nowrap"
                                                                    >
                                                                        Color
                                                                        Code
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="Enter your color code here"
                                                                        value={
                                                                            selectedServices.find(
                                                                                (
                                                                                    s
                                                                                ) =>
                                                                                    s.id ===
                                                                                    service._id!
                                                                            )
                                                                                ?.colorCode ||
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const updated =
                                                                                selectedServices.map(
                                                                                    (
                                                                                        s
                                                                                    ) =>
                                                                                        s.id ===
                                                                                        service._id!
                                                                                            ? {
                                                                                                  ...s,
                                                                                                  colorCode:
                                                                                                      e
                                                                                                          .target
                                                                                                          .value,
                                                                                              }
                                                                                            : s
                                                                                );
                                                                            form.setValue(
                                                                                'services',
                                                                                updated
                                                                            );
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}

                                                        {isSelected(
                                                            service._id!
                                                        ) &&
                                                            service.name ===
                                                                'Images Resizing' && (
                                                                <div className="flex items-center gap-4 mt-4">
                                                                    <div className="flex flex-col gap-2">
                                                                        <Label htmlFor="width">
                                                                            Width
                                                                        </Label>
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="Enter your width in pixels"
                                                                            value={
                                                                                selectedServices.find(
                                                                                    (
                                                                                        s
                                                                                    ) =>
                                                                                        s.id ===
                                                                                        service._id!
                                                                                )
                                                                                    ?.width ||
                                                                                ''
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const updated =
                                                                                    selectedServices.map(
                                                                                        (
                                                                                            s
                                                                                        ) =>
                                                                                            s.id ===
                                                                                            service._id!
                                                                                                ? {
                                                                                                      ...s,
                                                                                                      width:
                                                                                                          parseInt(
                                                                                                              e
                                                                                                                  .target
                                                                                                                  .value
                                                                                                          ) ||
                                                                                                          0,
                                                                                                  }
                                                                                                : s
                                                                                    );
                                                                                form.setValue(
                                                                                    'services',
                                                                                    updated
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        <Label htmlFor="height">
                                                                            Height
                                                                        </Label>
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="Enter your height in pixels"
                                                                            value={
                                                                                selectedServices.find(
                                                                                    (
                                                                                        s
                                                                                    ) =>
                                                                                        s.id ===
                                                                                        service._id!
                                                                                )
                                                                                    ?.height ||
                                                                                ''
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const updated =
                                                                                    selectedServices.map(
                                                                                        (
                                                                                            s
                                                                                        ) =>
                                                                                            s.id ===
                                                                                            service._id!
                                                                                                ? {
                                                                                                      ...s,
                                                                                                      height:
                                                                                                          parseInt(
                                                                                                              e
                                                                                                                  .target
                                                                                                                  .value
                                                                                                          ) ||
                                                                                                          0,
                                                                                                  }
                                                                                                : s
                                                                                    );
                                                                                form.setValue(
                                                                                    'services',
                                                                                    updated
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                )
                            )
                        )}
                        <FormMessage />
                    </CardContent>
                </Card>

                {form.formState.errors.services && (
                    <p className="text-destructive text-sm">
                        {form.formState.errors.services.message}
                    </p>
                )}

                <Button type="submit" className="w-full">
                    Submit
                </Button>
            </form>
        </Form>
    );
}
