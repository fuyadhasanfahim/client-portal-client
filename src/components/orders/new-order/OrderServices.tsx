'use client';

import ApiError from '@/components/shared/ApiError';
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
import { useNewDraftOrderMutation } from '@/redux/features/orders/ordersApi';
import newOrderServiceSchema from '@/validations/new-order.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightIcon, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Service {
    name: string;
    price?: number;
    types?: {
        name: string;
        complexities?: {
            name: string;
            price: number;
        }[];
    }[];
    complexities?: {
        name: string;
        price: number;
    }[];
    inputs?: boolean;
    instruction?: string;
}

export default function OrderServices({ userID }: { userID: string }) {
    const form = useForm<z.infer<typeof newOrderServiceSchema>>({
        resolver: zodResolver(newOrderServiceSchema),
        defaultValues: {
            serviceNames: [],
            types: [],
            options: [],
        },
    });

    const router = useRouter();
    const [newDraftOrder, { isLoading }] = useNewDraftOrderMutation();

    const onSubmit = async (data: z.infer<typeof newOrderServiceSchema>) => {
        try {
            // Transform the form data to match your API requirements
            const transformedServices = data.serviceNames
                .map((service) => {
                    const serviceDef = services.find(
                        (s) => s.name === service.name
                    );
                    if (!serviceDef) return null;

                    // Find selected types for this service
                    const selectedTypes = data.types
                        .filter((type) =>
                            serviceDef.types?.some(
                                (st) => st.name === type.name
                            )
                        )
                        .map((type) => ({
                            name: type.name,
                            complexity: type.complexity
                                ? {
                                      name: type.complexity.name,
                                      price: type.complexity.price,
                                  }
                                : undefined,
                        }));

                    // Find service-level complexity if no types are selected
                    const serviceComplexity =
                        selectedTypes.length === 0 && data.complexity
                            ? {
                                  name: data.complexity.name,
                                  price: data.complexity.price,
                              }
                            : undefined;

                    // Transform options
                    const serviceOptions = data.options.map((option) => ({
                        colorCodes: option.colorCodes || [],
                        dimensions:
                            option.height && option.width
                                ? { height: option.height, width: option.width }
                                : undefined,
                    }));

                    return {
                        name: service.name,
                        price: service.price,
                        ...(selectedTypes.length > 0
                            ? { types: selectedTypes }
                            : {}),
                        ...(serviceComplexity
                            ? { complexity: serviceComplexity }
                            : {}),
                        ...(serviceOptions.length > 0
                            ? { options: serviceOptions }
                            : {}),
                    };
                })
                .filter(Boolean);

            const response = await newDraftOrder({
                data: {
                    services: transformedServices,
                },
                userID,
            });

            if (response?.data?.success) {
                form.reset();
                router.push(
                    `/orders/new-order/${response.data.draftOrderId}/details`
                );
            }
        } catch (error) {
            ApiError(error);
        }
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
                            name="serviceNames"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <CardTitle>
                                        What services do you need today?
                                    </CardTitle>
                                    <div className="grid grid-cols-1 gap-4 pt-6">
                                        {services.map((service: Service) => {
                                            const isSelected =
                                                field.value?.some(
                                                    (s) =>
                                                        s.name === service.name
                                                );

                                            return (
                                                <Card key={service.name}>
                                                    <CardContent className="space-y-4">
                                                        {/* Service Checkbox */}
                                                        <FormItem className="flex items-center gap-3">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={
                                                                        isSelected
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked
                                                                    ) => {
                                                                        const current =
                                                                            field.value ||
                                                                            [];
                                                                        const updated =
                                                                            checked
                                                                                ? [
                                                                                      ...current,
                                                                                      {
                                                                                          name: service.name,
                                                                                          price: service.price,
                                                                                      },
                                                                                  ]
                                                                                : current.filter(
                                                                                      (
                                                                                          s
                                                                                      ) =>
                                                                                          s.name !==
                                                                                          service.name
                                                                                  );
                                                                        field.onChange(
                                                                            updated
                                                                        );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel>
                                                                {service.name}
                                                            </FormLabel>
                                                        </FormItem>

                                                        {/* Nested Type Checkboxes */}
                                                        {isSelected &&
                                                            service.types?.map(
                                                                (type) => {
                                                                    const isTypeSelected =
                                                                        form
                                                                            .watch(
                                                                                'types'
                                                                            )
                                                                            ?.some(
                                                                                (
                                                                                    t
                                                                                ) =>
                                                                                    t.name ===
                                                                                    type.name
                                                                            );

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                type.name
                                                                            }
                                                                            className="pl-4 space-y-2"
                                                                        >
                                                                            <FormField
                                                                                control={
                                                                                    form.control
                                                                                }
                                                                                name="types"
                                                                                render={({
                                                                                    field: typesField,
                                                                                }) => (
                                                                                    <FormItem className="flex items-center gap-3">
                                                                                        <FormControl>
                                                                                            <Checkbox
                                                                                                checked={
                                                                                                    isTypeSelected
                                                                                                }
                                                                                                onCheckedChange={(
                                                                                                    checked
                                                                                                ) => {
                                                                                                    const current =
                                                                                                        typesField.value ||
                                                                                                        [];
                                                                                                    const updated =
                                                                                                        checked
                                                                                                            ? [
                                                                                                                  ...current,
                                                                                                                  {
                                                                                                                      name: type.name,
                                                                                                                  },
                                                                                                              ]
                                                                                                            : current.filter(
                                                                                                                  (
                                                                                                                      t
                                                                                                                  ) =>
                                                                                                                      t.name !==
                                                                                                                      type.name
                                                                                                              );
                                                                                                    typesField.onChange(
                                                                                                        updated
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                        </FormControl>
                                                                                        <FormLabel>
                                                                                            {
                                                                                                type.name
                                                                                            }
                                                                                        </FormLabel>
                                                                                    </FormItem>
                                                                                )}
                                                                            />

                                                                            {/* Nested Complexities under Type */}
                                                                            {isTypeSelected &&
                                                                                (
                                                                                    type.complexities ??
                                                                                    []
                                                                                )
                                                                                    .length >
                                                                                    0 && (
                                                                                    <FormField
                                                                                        control={
                                                                                            form.control
                                                                                        }
                                                                                        name="types"
                                                                                        render={({
                                                                                            field: typesField,
                                                                                        }) => {
                                                                                            const typeIndex =
                                                                                                typesField.value?.findIndex(
                                                                                                    (
                                                                                                        t
                                                                                                    ) =>
                                                                                                        t.name ===
                                                                                                        type.name
                                                                                                ) ??
                                                                                                -1;

                                                                                            return (
                                                                                                <FormItem className="space-y-2 pl-6">
                                                                                                    <FormControl>
                                                                                                        <RadioGroup
                                                                                                            value={
                                                                                                                (typeIndex >=
                                                                                                                    0 &&
                                                                                                                    typesField
                                                                                                                        .value?.[
                                                                                                                        typeIndex
                                                                                                                    ]
                                                                                                                        ?.complexity
                                                                                                                        ?.name) ||
                                                                                                                ''
                                                                                                            }
                                                                                                            onValueChange={(
                                                                                                                value
                                                                                                            ) => {
                                                                                                                const current =
                                                                                                                    [
                                                                                                                        ...(typesField.value ||
                                                                                                                            []),
                                                                                                                    ];
                                                                                                                if (
                                                                                                                    typeIndex >=
                                                                                                                    0
                                                                                                                ) {
                                                                                                                    const selectedComplexity =
                                                                                                                        type.complexities?.find(
                                                                                                                            (
                                                                                                                                c
                                                                                                                            ) =>
                                                                                                                                c.name ===
                                                                                                                                value
                                                                                                                        );
                                                                                                                    current[
                                                                                                                        typeIndex
                                                                                                                    ] =
                                                                                                                        {
                                                                                                                            ...current[
                                                                                                                                typeIndex
                                                                                                                            ],
                                                                                                                            complexity:
                                                                                                                                selectedComplexity
                                                                                                                                    ? {
                                                                                                                                          name: selectedComplexity.name,
                                                                                                                                          price: selectedComplexity.price,
                                                                                                                                      }
                                                                                                                                    : undefined,
                                                                                                                        };
                                                                                                                }
                                                                                                                typesField.onChange(
                                                                                                                    current
                                                                                                                );
                                                                                                            }}
                                                                                                        >
                                                                                                            {type.complexities?.map(
                                                                                                                (
                                                                                                                    complexity
                                                                                                                ) => (
                                                                                                                    <FormItem
                                                                                                                        key={
                                                                                                                            complexity.name
                                                                                                                        }
                                                                                                                        className="flex items-center space-x-3 space-y-0"
                                                                                                                    >
                                                                                                                        <FormControl>
                                                                                                                            <RadioGroupItem
                                                                                                                                value={
                                                                                                                                    complexity.name
                                                                                                                                }
                                                                                                                            />
                                                                                                                        </FormControl>
                                                                                                                        <FormLabel>
                                                                                                                            {
                                                                                                                                complexity.name
                                                                                                                            }{' '}
                                                                                                                            ($
                                                                                                                            {
                                                                                                                                complexity.price
                                                                                                                            }

                                                                                                                            )
                                                                                                                        </FormLabel>
                                                                                                                    </FormItem>
                                                                                                                )
                                                                                                            )}
                                                                                                        </RadioGroup>
                                                                                                    </FormControl>
                                                                                                </FormItem>
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                        </div>
                                                                    );
                                                                }
                                                            )}

                                                        {/* Flat Complexity Radios */}
                                                        {isSelected &&
                                                            (
                                                                service.complexities ??
                                                                []
                                                            ).length > 0 && (
                                                                <FormField
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name="complexity"
                                                                    render={({
                                                                        field,
                                                                    }) => (
                                                                        <FormItem className="space-y-2 pl-4">
                                                                            <FormControl>
                                                                                <RadioGroup
                                                                                    value={
                                                                                        field
                                                                                            .value
                                                                                            ?.name ||
                                                                                        ''
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value
                                                                                    ) => {
                                                                                        const selected =
                                                                                            service.complexities?.find(
                                                                                                (
                                                                                                    c
                                                                                                ) =>
                                                                                                    c.name ===
                                                                                                    value
                                                                                            );
                                                                                        field.onChange(
                                                                                            selected
                                                                                                ? {
                                                                                                      name: selected.name,
                                                                                                      price: selected.price,
                                                                                                  }
                                                                                                : undefined
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    {service.complexities?.map(
                                                                                        (
                                                                                            complexity
                                                                                        ) => (
                                                                                            <FormItem
                                                                                                key={
                                                                                                    complexity.name
                                                                                                }
                                                                                                className="flex items-center space-x-3 space-y-0"
                                                                                            >
                                                                                                <FormControl>
                                                                                                    <RadioGroupItem
                                                                                                        value={
                                                                                                            complexity.name
                                                                                                        }
                                                                                                    />
                                                                                                </FormControl>
                                                                                                <FormLabel>
                                                                                                    {
                                                                                                        complexity.name
                                                                                                    }{' '}
                                                                                                    ($
                                                                                                    {
                                                                                                        complexity.price
                                                                                                    }

                                                                                                    )
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

                                                        {/* Input Fields (e.g. Color Code) */}
                                                        {isSelected &&
                                                            service.inputs && (
                                                                <FormField
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name="options"
                                                                    render={({
                                                                        field,
                                                                    }) => (
                                                                        <FormItem className="space-y-2 pt-2">
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {
                                                                                    service.instruction
                                                                                }
                                                                            </p>
                                                                            {(
                                                                                field.value ||
                                                                                []
                                                                            ).map(
                                                                                (
                                                                                    option,
                                                                                    index
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        className="space-y-2"
                                                                                    >
                                                                                        <div className="flex items-center gap-2">
                                                                                            <FormControl>
                                                                                                <Input
                                                                                                    value={
                                                                                                        option
                                                                                                            .colorCodes?.[0] ||
                                                                                                        ''
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        e
                                                                                                    ) => {
                                                                                                        const updated =
                                                                                                            [
                                                                                                                ...(field.value ||
                                                                                                                    []),
                                                                                                            ];
                                                                                                        updated[
                                                                                                            index
                                                                                                        ] =
                                                                                                            {
                                                                                                                ...updated[
                                                                                                                    index
                                                                                                                ],
                                                                                                                colorCodes:
                                                                                                                    [
                                                                                                                        e
                                                                                                                            .target
                                                                                                                            .value,
                                                                                                                    ],
                                                                                                            };
                                                                                                        field.onChange(
                                                                                                            updated
                                                                                                        );
                                                                                                    }}
                                                                                                    placeholder="Enter color code"
                                                                                                />
                                                                                            </FormControl>
                                                                                            <Button
                                                                                                type="button"
                                                                                                variant="outline"
                                                                                                size="icon"
                                                                                                onClick={() => {
                                                                                                    const updated =
                                                                                                        (
                                                                                                            field.value ||
                                                                                                            []
                                                                                                        ).filter(
                                                                                                            (
                                                                                                                _,
                                                                                                                i
                                                                                                            ) =>
                                                                                                                i !==
                                                                                                                index
                                                                                                        );
                                                                                                    field.onChange(
                                                                                                        updated
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                <X className="text-destructive" />
                                                                                            </Button>
                                                                                        </div>
                                                                                        <div className="flex gap-2">
                                                                                            <FormControl>
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    value={
                                                                                                        option.height ||
                                                                                                        ''
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        e
                                                                                                    ) => {
                                                                                                        const updated =
                                                                                                            [
                                                                                                                ...(field.value ||
                                                                                                                    []),
                                                                                                            ];
                                                                                                        updated[
                                                                                                            index
                                                                                                        ] =
                                                                                                            {
                                                                                                                ...updated[
                                                                                                                    index
                                                                                                                ],
                                                                                                                height: Number(
                                                                                                                    e
                                                                                                                        .target
                                                                                                                        .value
                                                                                                                ),
                                                                                                            };
                                                                                                        field.onChange(
                                                                                                            updated
                                                                                                        );
                                                                                                    }}
                                                                                                    placeholder="Height"
                                                                                                />
                                                                                            </FormControl>
                                                                                            <FormControl>
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    value={
                                                                                                        option.width ||
                                                                                                        ''
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        e
                                                                                                    ) => {
                                                                                                        const updated =
                                                                                                            [
                                                                                                                ...(field.value ||
                                                                                                                    []),
                                                                                                            ];
                                                                                                        updated[
                                                                                                            index
                                                                                                        ] =
                                                                                                            {
                                                                                                                ...updated[
                                                                                                                    index
                                                                                                                ],
                                                                                                                width: Number(
                                                                                                                    e
                                                                                                                        .target
                                                                                                                        .value
                                                                                                                ),
                                                                                                            };
                                                                                                        field.onChange(
                                                                                                            updated
                                                                                                        );
                                                                                                    }}
                                                                                                    placeholder="Width"
                                                                                                />
                                                                                            </FormControl>
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                className="w-full"
                                                                                onClick={() =>
                                                                                    field.onChange(
                                                                                        [
                                                                                            ...(field.value ||
                                                                                                []),
                                                                                            {
                                                                                                colorCodes:
                                                                                                    [
                                                                                                        '',
                                                                                                    ],
                                                                                            },
                                                                                        ]
                                                                                    )
                                                                                }
                                                                            >
                                                                                Add
                                                                                Another
                                                                                Option
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
                        <Button
                            className="w-full"
                            size="lg"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Uploading...' : 'Upload Images'}
                            {isLoading ? (
                                <Loader2 className="ml-2 animate-spin" />
                            ) : (
                                <ArrowRightIcon className="ml-2" />
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
