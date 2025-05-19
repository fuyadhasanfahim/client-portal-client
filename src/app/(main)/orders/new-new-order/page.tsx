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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import services from '@/data/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightIcon, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    services: z
        .array(
            z.object({
                title: z.string(),
                value: z.string(),
            })
        )
        .min(1, 'Select at least one service, before going to upload photos.'),
    selectedCheckboxes: z.record(z.array(z.string())).optional(),
    nestedRadios: z.record(z.record(z.string())).optional(),
    selectedRadios: z.record(z.string()).optional(),
    colorInputs: z.record(z.array(z.string())).optional(),
});

type NewOrderFormValues = z.infer<typeof formSchema>;

export default function NewOrderPage() {
    const form = useForm<NewOrderFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            services: [],
            selectedCheckboxes: {},
            nestedRadios: {},
            colorInputs: {},
        },
    });

    const getCheckboxPath = <T extends string>(key: T) =>
        `selectedCheckboxes.${key}` as const;

    const onSubmit = (data: NewOrderFormValues) => {
        const selected = data.services || [];

        const result = selected
            .map((serviceValue) => {
                const serviceDef = services.find(
                    (s) => s.value === serviceValue.value
                );
                if (!serviceDef) return null;

                const checkboxes =
                    data.selectedCheckboxes?.[serviceValue.value] || [];
                const nested = checkboxes.map((checkboxValue: string) => {
                    const checkboxDef = serviceDef.checkboxes?.find(
                        (c) => c.value === checkboxValue
                    );
                    const hasRadios = (checkboxDef?.radios ?? []).length > 0;
                    const radioValue =
                        data.nestedRadios?.[serviceValue.value]?.[
                            checkboxValue
                        ]?.trim?.();

                    const result: { value: string; radio?: { value: string } } =
                        {
                            value: checkboxValue,
                        };

                    if (hasRadios && radioValue) {
                        result.radio = { value: radioValue };
                    }

                    return result;
                });

                const radioValue = data.selectedRadios?.[serviceValue.value];
                const colorValues = (
                    data.colorInputs?.[serviceValue.value] ?? []
                ).filter((c) => c.trim());

                return {
                    value: serviceValue.value,
                    ...(nested.length > 0 && { checkboxes: nested }),
                    ...(radioValue &&
                        nested.length === 0 && {
                            radio: { value: radioValue },
                        }),
                    ...(colorValues.length > 0 && { colorValues }),
                };
            })
            .filter(Boolean);

        console.log('Normalized Service Selection:', result);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Order Your Edits
                        </CardTitle>
                        <CardDescription className="text-base">
                            Tell us what you need, and we&apos;ll generate
                            instant pricing on the spot.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="services"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <CardTitle>
                                        What services do you need today?
                                    </CardTitle>
                                    <div className="grid grid-cols-1 gap-4 pt-6">
                                        {services.map((service) => {
                                            const isSelected = field.value.some(
                                                (v) => v.value === service.value
                                            );

                                            return (
                                                <Card key={service.value}>
                                                    <CardContent className="space-y-4">
                                                        {/* Top-level Service Checkbox */}
                                                        <FormItem className="flex items-center gap-3">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={
                                                                        isSelected
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked
                                                                    ) => {
                                                                        if (
                                                                            checked
                                                                        ) {
                                                                            field.onChange(
                                                                                [
                                                                                    ...field.value,
                                                                                    {
                                                                                        value: service.value,
                                                                                        title: service.name,
                                                                                    },
                                                                                ]
                                                                            );
                                                                        } else {
                                                                            field.onChange(
                                                                                field.value.filter(
                                                                                    (
                                                                                        v
                                                                                    ) =>
                                                                                        v.value !==
                                                                                        service.value
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel>
                                                                {service.name}
                                                            </FormLabel>
                                                        </FormItem>

                                                        {/* Nested Radios under Checkboxes */}
                                                        {isSelected &&
                                                            service.checkboxes?.map(
                                                                (checkbox) => {
                                                                    const checkboxPath =
                                                                        `selectedCheckboxes.${service.value}` as const;
                                                                    const selected =
                                                                        form.watch(
                                                                            checkboxPath
                                                                        ) || [];
                                                                    const isChecked =
                                                                        selected.includes(
                                                                            checkbox.value
                                                                        );

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                checkbox.value
                                                                            }
                                                                            className="pl-4 space-y-2"
                                                                        >
                                                                            {/* Checkbox */}
                                                                            <FormField
                                                                                control={
                                                                                    form.control
                                                                                }
                                                                                name={getCheckboxPath(
                                                                                    service.value
                                                                                )}
                                                                                render={({
                                                                                    field,
                                                                                }) => (
                                                                                    <FormItem className="flex items-center gap-3">
                                                                                        <FormControl>
                                                                                            <Checkbox
                                                                                                checked={
                                                                                                    isChecked
                                                                                                }
                                                                                                onCheckedChange={(
                                                                                                    checked
                                                                                                ) => {
                                                                                                    const current =
                                                                                                        (field.value as string[]) ||
                                                                                                        [];
                                                                                                    const updated =
                                                                                                        checked
                                                                                                            ? [
                                                                                                                  ...current,
                                                                                                                  checkbox.value,
                                                                                                              ]
                                                                                                            : current.filter(
                                                                                                                  (
                                                                                                                      v
                                                                                                                  ) =>
                                                                                                                      v !==
                                                                                                                      checkbox.value
                                                                                                              );
                                                                                                    field.onChange(
                                                                                                        updated
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                        </FormControl>
                                                                                        <FormLabel>
                                                                                            {
                                                                                                checkbox.name
                                                                                            }
                                                                                        </FormLabel>
                                                                                    </FormItem>
                                                                                )}
                                                                            />

                                                                            {/* Radios under that checkbox */}
                                                                            {isChecked &&
                                                                                (
                                                                                    checkbox.radios ??
                                                                                    []
                                                                                )
                                                                                    .length >
                                                                                    0 && (
                                                                                    <FormField
                                                                                        control={
                                                                                            form.control
                                                                                        }
                                                                                        name={`nestedRadios.${service.value}.${checkbox.value}`}
                                                                                        render={({
                                                                                            field: radioField,
                                                                                        }) => (
                                                                                            <FormItem className="space-y-2 pl-6">
                                                                                                <FormControl>
                                                                                                    <RadioGroup
                                                                                                        onValueChange={
                                                                                                            radioField.onChange
                                                                                                        }
                                                                                                        value={
                                                                                                            radioField.value ??
                                                                                                            ''
                                                                                                        }
                                                                                                    >
                                                                                                        {checkbox.radios?.map(
                                                                                                            (
                                                                                                                r
                                                                                                            ) => (
                                                                                                                <FormItem
                                                                                                                    key={
                                                                                                                        r.value
                                                                                                                    }
                                                                                                                    className="flex items-center space-x-3 space-y-0"
                                                                                                                >
                                                                                                                    <FormControl>
                                                                                                                        <RadioGroupItem
                                                                                                                            value={
                                                                                                                                r.value
                                                                                                                            }
                                                                                                                        />
                                                                                                                    </FormControl>
                                                                                                                    <FormLabel>
                                                                                                                        {
                                                                                                                            r.name
                                                                                                                        }
                                                                                                                    </FormLabel>
                                                                                                                </FormItem>
                                                                                                            )
                                                                                                        )}
                                                                                                    </RadioGroup>
                                                                                                </FormControl>
                                                                                            </FormItem>
                                                                                        )}
                                                                                    />
                                                                                )}
                                                                        </div>
                                                                    );
                                                                }
                                                            )}

                                                        {/* Direct Radios (no checkboxes) */}
                                                        {isSelected &&
                                                            !service.checkboxes
                                                                ?.length &&
                                                            service.radios
                                                                ?.length && (
                                                                <FormField
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name={`selectedRadios.${service.value}`}
                                                                    render={({
                                                                        field: radioField,
                                                                    }) => (
                                                                        <FormItem className="space-y-2 pl-4">
                                                                            <FormControl>
                                                                                <RadioGroup
                                                                                    onValueChange={
                                                                                        radioField.onChange
                                                                                    }
                                                                                    value={
                                                                                        radioField.value
                                                                                    }
                                                                                >
                                                                                    {service.radios.map(
                                                                                        (
                                                                                            r
                                                                                        ) => (
                                                                                            <FormItem
                                                                                                key={
                                                                                                    r.value
                                                                                                }
                                                                                                className="flex items-center space-x-3 space-y-0"
                                                                                            >
                                                                                                <FormControl>
                                                                                                    <RadioGroupItem
                                                                                                        value={
                                                                                                            r.value
                                                                                                        }
                                                                                                    />
                                                                                                </FormControl>
                                                                                                <FormLabel>
                                                                                                    {
                                                                                                        r.name
                                                                                                    }
                                                                                                </FormLabel>
                                                                                            </FormItem>
                                                                                        )
                                                                                    )}
                                                                                </RadioGroup>
                                                                            </FormControl>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            )}

                                                        {/* Inputs */}
                                                        {isSelected &&
                                                            service.inputs && (
                                                                <FormField
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name={`colorInputs.${service.value}`}
                                                                    render={({
                                                                        field: inputField,
                                                                    }) => (
                                                                        <FormItem className="space-y-2 pt-2">
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {
                                                                                    service.instruction
                                                                                }
                                                                            </p>
                                                                            {(
                                                                                inputField.value ||
                                                                                []
                                                                            ).map(
                                                                                (
                                                                                    val,
                                                                                    index
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        className="flex items-center gap-2"
                                                                                    >
                                                                                        <FormControl>
                                                                                            <Input
                                                                                                value={
                                                                                                    val
                                                                                                }
                                                                                                onChange={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    const updated =
                                                                                                        [
                                                                                                            ...inputField.value,
                                                                                                        ];
                                                                                                    updated[
                                                                                                        index
                                                                                                    ] =
                                                                                                        e.target.value;
                                                                                                    inputField.onChange(
                                                                                                        updated
                                                                                                    );
                                                                                                }}
                                                                                                placeholder="Enter color code or name"
                                                                                            />
                                                                                        </FormControl>
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="outline"
                                                                                            size="icon"
                                                                                            onClick={() => {
                                                                                                const updated =
                                                                                                    inputField.value.filter(
                                                                                                        (
                                                                                                            _,
                                                                                                            i
                                                                                                        ) =>
                                                                                                            i !==
                                                                                                            index
                                                                                                    );
                                                                                                inputField.onChange(
                                                                                                    updated
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            <X className="text-destructive" />
                                                                                        </Button>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                className="w-full"
                                                                                onClick={() =>
                                                                                    inputField.onChange(
                                                                                        [
                                                                                            ...(inputField.value ||
                                                                                                []),
                                                                                            '',
                                                                                        ]
                                                                                    )
                                                                                }
                                                                            >
                                                                                Add
                                                                                Another
                                                                                Color
                                                                            </Button>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            )}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" type="submit">
                            Upload Images <ArrowRightIcon />
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
