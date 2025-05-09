import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { addServiceSchema } from '@/validations/add-service.schema';
import {
    IconCurrencyDollar,
    IconPlus,
    IconTag,
    IconTrash,
} from '@tabler/icons-react';
import {
    UseFormReturn,
    UseFieldArrayRemove,
    UseFieldArrayAppend,
    FieldArrayWithId,
} from 'react-hook-form';
import { z } from 'zod';

type AddServiceFormType = z.infer<typeof addServiceSchema>;

export interface PricingTiersProps {
    remove: UseFieldArrayRemove;
    append: UseFieldArrayAppend<AddServiceFormType, 'complexities'>;
    fields: FieldArrayWithId<AddServiceFormType, 'complexities', 'id'>[];
    hasComplexPricing: boolean;
    form: UseFormReturn<AddServiceFormType>;
}

export default function PricingTiers({
    remove,
    hasComplexPricing,
    fields,
    append,
    form,
}: PricingTiersProps) {
    return (
        hasComplexPricing && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconTag size={20} />
                        <span>Pricing Tiers</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {fields.length === 0 ? (
                            <div className="text-center py-8 bg-green-50 border-2 border-dashed rounded-lg">
                                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                    <IconPlus className="text-primary" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-800 mb-1">
                                    No pricing tiers yet
                                </h3>
                                <p className="text-slate-500 mb-4 max-w-md mx-auto">
                                    Add different pricing tiers for different
                                    service levels
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        append({
                                            label: '',
                                            price: 0,
                                        })
                                    }
                                    className="border-primary bg-white text-primary"
                                >
                                    <IconPlus size={16} />
                                    Add First Tier
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {fields.map((item, index: number) => (
                                        <div
                                            key={item.id}
                                            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border border-slate-200 rounded-lg bg-white shadow-xs"
                                        >
                                            <FormField
                                                control={form.control}
                                                name={`complexities.${index}.label`}
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-5 space-y-2">
                                                        <FormLabel>
                                                            Tier Name{' '}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g. Basic, Pro, Enterprise"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-red-500 text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`complexities.${index}.price`}
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-5 space-y-2">
                                                        <FormLabel className="text-slate-700">
                                                            Price{' '}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-2.5 text-slate-500">
                                                                    <IconCurrencyDollar
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </span>
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        field.value ||
                                                                        ''
                                                                    }
                                                                    placeholder="e.g. 99.99"
                                                                    step="0.01"
                                                                    min="0"
                                                                    className="pl-10"
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        field.onChange(
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-red-500 text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="md:col-span-2 flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        remove(index)
                                                    }
                                                    className="border-destructive text-destructive bg-red-50"
                                                >
                                                    <IconTrash size={16} />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        append({
                                            label: '',
                                            price: 0,
                                        })
                                    }
                                    className="border-primary bg-white text-primary"
                                >
                                    <IconPlus size={16} className="mr-1" />
                                    Add Another Tier
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    );
}
