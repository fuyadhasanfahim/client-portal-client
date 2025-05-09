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
import { IconPlus, IconTag, IconTrash } from '@tabler/icons-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export default function ServiceTypes({
    typeFields,
    appendType,
    removeType,
    form,
}: {
    form: UseFormReturn<z.infer<typeof addServiceSchema>>;
    typeFields: { title: string }[];
    appendType: (type: { title: string }) => void;
    removeType: (index: number) => void;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <IconTag size={20} className="text-primary" />
                    Service Types
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {typeFields.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
                        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                            <IconPlus className="text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                            No service types added yet
                        </h3>
                        <p className="text-slate-600 text-sm mb-4 max-w-md mx-auto">
                            Add custom labels like Add-ons, Express Service,
                            etc. to help categorize services
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendType({ title: '' })}
                            className="border-primary text-primary bg-white hover:bg-primary hover:text-white transition"
                        >
                            <IconPlus size={16} className="mr-1" />
                            Add First Type
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {typeFields.map((item, index: number) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end p-4 border border-slate-200 rounded-lg bg-white shadow-sm"
                                >
                                    <FormField
                                        control={form.control}
                                        name={`types.${index}.title`}
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-10">
                                                <FormLabel className="flex items-center gap-1">
                                                    Type Title{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. Add-on, Fast Delivery"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="md:col-span-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeType(index)}
                                            className="text-destructive bg-red-50 border-destructive hover:bg-red-500 hover:text-white transition-all duration-200"
                                        >
                                            <IconTrash
                                                size={16}
                                                className="mr-1"
                                            />{' '}
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendType({ title: '' })}
                            className="border-primary text-primary bg-white hover:bg-primary hover:text-white transition"
                        >
                            <IconPlus size={16} />
                            Add Another Type
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
