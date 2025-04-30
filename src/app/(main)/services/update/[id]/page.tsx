'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    IconDeviceFloppy,
    IconTrash,
    IconPlus,
    IconRestore,
} from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import ApiError from '@/components/shared/ApiError';
import { toast } from 'sonner';
import { useEffect } from 'react';
import {
    useGetSingleServiceQuery,
    useUpdateServiceMutation,
} from '@/redux/features/services/servicesApi';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateServiceSchema } from '@/validations/update-service.schema';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

export default function EditServicePage() {
    const { id } = useParams();
    const router = useRouter();

    const form = useForm<z.infer<typeof updateServiceSchema>>({
        resolver: zodResolver(updateServiceSchema),
        defaultValues: {
            name: '',
            complexities: [],
            status: '',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'complexities',
    });

    const { data, isLoading } = useGetSingleServiceQuery(id);

    useEffect(() => {
        if (data && !isLoading) {
            form.reset({
                name: data.data.name,
                complexities: data.data.complexities,
                status: data.data.status,
            });
        }
    }, [data, isLoading, form]);

    const [updateService, { isLoading: isUpdating }] =
        useUpdateServiceMutation();

    const onSubmit = async (data: z.infer<typeof updateServiceSchema>) => {
        try {
            const response = await updateService({ ...data, id }).unwrap();

            if (response.success) {
                toast.success(response.message);
                form.reset({
                    name: data.name,
                    complexities: data.complexities,
                    status: data.status,
                });

                router.push('/services');
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Update service Form</CardTitle>
            </CardHeader>
            <CardContent>
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

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-38">
                                                <SelectValue placeholder="Select value" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="Active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="Inactive">
                                                Inactive
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The value is by default set to Pending.
                                        You can change it here, or later in the
                                        edit page.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
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
                                                        value={
                                                            field.value || ''
                                                        }
                                                        placeholder="e.g. 0.46"
                                                        step="0.01"
                                                        min="0"
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                Number(
                                                                    e.target
                                                                        .value
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
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => append({ label: '', price: 0 })}
                            >
                                <IconPlus size={16} />
                                Add Complexity
                            </Button>
                        </div>

                        <div className="flex items-center gap-6 w-full">
                            <Button
                                type="reset"
                                variant={'destructive'}
                                onClick={() => router.push('/services')}
                                disabled={isUpdating}
                            >
                                <ArrowLeft />
                                Back
                            </Button>
                            <Button
                                type="reset"
                                variant={'outline'}
                                onClick={() => form.reset()}
                                disabled={isUpdating}
                            >
                                <IconRestore />
                                Reset
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                <IconDeviceFloppy />
                                Update Service
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
