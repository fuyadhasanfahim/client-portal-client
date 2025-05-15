'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import IService, { IType } from '@/types/service.interface';
import { addOrderSchema } from '@/validations/add-order.schema';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FormServicesProps {
    servicesData: IService[];
    isServiceLoading: boolean;
    form: UseFormReturn<z.infer<typeof addOrderSchema>>;
    selectedServices: z.infer<typeof addOrderSchema>['services'];
    getServiceData: (
        id: string
    ) => z.infer<typeof addOrderSchema>['services'][number] | undefined;
    isSelected: (id: string) => boolean;
    toggleService: (service: IService) => void;
    toggleType: (serviceId: string, type: string) => void;
    updateComplexity: (serviceId: string, value: string) => void;
}

export default function FormServices({
    servicesData,
    isServiceLoading,
    form,
    getServiceData,
    isSelected,
    toggleService,
    toggleType,
    selectedServices,
    updateComplexity,
}: FormServicesProps) {
    if (isServiceLoading) {
        return (
            <div className="grid grid-cols-2 gap-6 p-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
            </div>
        );
    }

    if (servicesData.length === 0) {
        return (
            <div className="flex items-center justify-center h-24 w-full">
                <p>No service found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pb-6">
            {servicesData.map((service) => {
                const selected = getServiceData(service._id!);

                return (
                    <FormField
                        key={service._id}
                        control={form.control}
                        name="services"
                        render={() => (
                            <FormItem className="space-y-3 border rounded-md p-4">
                                {/* Header */}
                                <div className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={isSelected(service._id!)}
                                            onCheckedChange={() =>
                                                toggleService(service)
                                            }
                                        />
                                    </FormControl>
                                    <FormLabel className="font-medium flex justify-between w-full">
                                        <span>{service.name}</span>
                                        {service.price ? (
                                            <Badge>${service.price}</Badge>
                                        ) : (service.types ?? []).length > 0 ? (
                                            <Badge>
                                                Select Types & Complexity
                                            </Badge>
                                        ) : (
                                            <Badge>Select Complexity</Badge>
                                        )}
                                    </FormLabel>
                                </div>

                                {/* Types */}
                                {isSelected(service._id!) &&
                                    (service.types ?? []).length > 0 && (
                                        <div className="pl-6 space-y-2">
                                            <p className="font-semibold">
                                                Select Types:
                                            </p>
                                            {(service.types ?? []).map((t) => (
                                                <FormItem
                                                    key={`${service._id}-${t.title}`}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={selected?.types?.some(
                                                                (sel: IType) =>
                                                                    sel.title ===
                                                                    t.title
                                                            )}
                                                            onCheckedChange={() =>
                                                                toggleType(
                                                                    service._id!,
                                                                    t.title
                                                                )
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormLabel>
                                                        {t.title}
                                                    </FormLabel>
                                                </FormItem>
                                            ))}

                                            {selected?.types?.some(
                                                (type) =>
                                                    type.title === 'Custom Size'
                                            ) && (
                                                <div className="mt-4 w-full flex items-center gap-6">
                                                    <div className="flex flex-col gap-2 w-full">
                                                        <Label htmlFor="width">
                                                            Width *
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Enter the width"
                                                            value={
                                                                selected?.width ??
                                                                ''
                                                            }
                                                            onChange={(e) => {
                                                                const value =
                                                                    parseFloat(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                const updated =
                                                                    selectedServices.map(
                                                                        (s) =>
                                                                            s._id ===
                                                                            service._id
                                                                                ? {
                                                                                      ...s,
                                                                                      width: isNaN(
                                                                                          value
                                                                                      )
                                                                                          ? undefined
                                                                                          : value,
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
                                                    <div className="flex flex-col gap-2 w-full">
                                                        <Label htmlFor="height">
                                                            Height *
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Enter the height"
                                                            value={
                                                                selected?.height ??
                                                                ''
                                                            }
                                                            onChange={(e) => {
                                                                const value =
                                                                    parseFloat(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                const updated =
                                                                    selectedServices.map(
                                                                        (s) =>
                                                                            s._id ===
                                                                            service._id
                                                                                ? {
                                                                                      ...s,
                                                                                      width: isNaN(
                                                                                          value
                                                                                      )
                                                                                          ? undefined
                                                                                          : value,
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

                                            {/* Custom Color Code input */}
                                            {selected?.name ===
                                                'Background Removal' &&
                                                selected.types?.some(
                                                    (type: IType) =>
                                                        type.title ===
                                                        'Custom Color'
                                                ) && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Label
                                                            htmlFor="colorCode"
                                                            className="font-semibold text-sm"
                                                        >
                                                            Color Code:
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            id="colorCode"
                                                            value={
                                                                selected.colorCode ||
                                                                ''
                                                            }
                                                            placeholder="Enter color code"
                                                            onChange={(e) => {
                                                                const updated =
                                                                    selectedServices.map(
                                                                        (s) =>
                                                                            s._id ===
                                                                            service._id
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
                                        </div>
                                    )}

                                {/* Complexity */}
                                {isSelected(service._id!) &&
                                    (service.complexities ?? []).length > 0 &&
                                    (!service.types?.length ||
                                        selected?.types?.length) && (
                                        <div className="pl-6 space-y-2">
                                            <p className="font-semibold">
                                                Select Complexity:
                                            </p>
                                            <FormControl>
                                                <RadioGroup
                                                    value={`${selected?.complexity?.label}:$${selected?.complexity?.price}`}
                                                    onValueChange={(val) =>
                                                        updateComplexity(
                                                            service._id!,
                                                            val
                                                        )
                                                    }
                                                >
                                                    {service.complexities?.map(
                                                        (c) => (
                                                            <FormItem
                                                                key={c.label}
                                                                className="flex items-center space-x-2"
                                                            >
                                                                <FormControl>
                                                                    <RadioGroupItem
                                                                        value={`${c.label}:$${c.price}`}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel>
                                                                    {c.label} -
                                                                    ${c.price}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    )}
                                                </RadioGroup>
                                            </FormControl>
                                        </div>
                                    )}

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );
            })}
        </div>
    );
}
