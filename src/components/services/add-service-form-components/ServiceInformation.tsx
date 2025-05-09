import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { addServiceSchema } from '@/validations/add-service.schema';
import { IconCurrencyDollar, IconPackage } from '@tabler/icons-react';
import { TriangleAlert } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

interface PageProps {
    hasComplexPricing: boolean;
    setHasComplexPricing: (checked: boolean) => void;
    form: UseFormReturn<z.infer<typeof addServiceSchema>>;
}

export default function ServiceInformation({
    hasComplexPricing,
    setHasComplexPricing,
    form,
}: PageProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IconPackage size={20} />
                    <span>Service Information</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>
                                    Service Name
                                    <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. Clipping Path"
                                        required
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel>Base Price</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-500">
                                                <IconCurrencyDollar size={18} />
                                            </span>
                                            <Input
                                                type="number"
                                                value={field.value || ''}
                                                placeholder="e.g. 49.99"
                                                step="0.01"
                                                min="0"
                                                disabled={hasComplexPricing}
                                                className="pl-10"
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </div>
                                    </FormControl>
                                    {hasComplexPricing && (
                                        <FormDescription className="text-amber-600 text-xs flex items-center gap-1">
                                            <TriangleAlert size={16} />
                                            <span>
                                                Fixed price is disabled when
                                                using complex pricing
                                            </span>
                                        </FormDescription>
                                    )}
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={hasComplexPricing}
                                    onCheckedChange={(checked) => {
                                        setHasComplexPricing(checked);
                                        if (!checked) {
                                            form.setValue('complexities', []);
                                        }
                                    }}
                                    id="complex-pricing"
                                />
                                <FormLabel htmlFor="complex-pricing">
                                    Enable Tiered Pricing
                                </FormLabel>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
