'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
    IconDeviceFloppy,
    IconTrash,
    IconPlus,
    IconRestore,
} from '@tabler/icons-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addServiceSchema } from '@/validations/add-service.schema';
import ApiError from '../shared/ApiError';
import axiosInstance from '@/lib/axios-instance';
import { toast } from 'sonner';
import { useRef } from 'react';
import { DialogClose } from '../ui/dialog';

export default function AddServiceForm() {
    const closeRef = useRef<HTMLButtonElement | null>(null);

    const form = useForm({
        resolver: zodResolver(addServiceSchema),
        defaultValues: {
            name: '',
            complexities: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'complexities',
    });

    const onSubmit = async (data: z.infer<typeof addServiceSchema>) => {
        try {
            const response = await axiosInstance.post(
                '/services/add-service',
                data
            );

            if (response.status === 201) {
                toast.success(response.data.message);

                form.reset();

                closeRef.current?.click();
            } else {
                toast.error(response.data.error?.message);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <>
            <DialogClose asChild>
                <Button ref={closeRef} className="hidden" />
            </DialogClose>

            <Form {...form}>
                <form
                    className="space-y-6 px-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Service Name *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter the service name"
                                        required
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-4">
                        {fields.length === 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => append({ label: '', price: 0 })}
                            >
                                <IconPlus size={16} />
                                Add Complexity
                            </Button>
                        )}

                        {fields.map((item, index) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"
                            >
                                <FormField
                                    control={form.control}
                                    name={`complexities.${index}.label`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Label *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. Basic"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`complexities.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseFloat(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => remove(index)}
                                    >
                                        <IconTrash size={16} />
                                        Delete
                                    </Button>
                                    {index === fields.length - 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                append({ label: '', price: 0 })
                                            }
                                        >
                                            <IconPlus size={16} />
                                            Add Complexity
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-6 w-full">
                        <Button
                            type="reset"
                            variant={'outline'}
                            onClick={() => form.reset()}
                        >
                            <IconRestore />
                            Reset
                        </Button>
                        <Button type="submit">
                            <IconDeviceFloppy />
                            Add Service
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
