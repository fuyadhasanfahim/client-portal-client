'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormMessage } from '../ui/form';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useGetServicesForUserQuery } from '@/redux/features/services/servicesApi';
import FormServices from './form-components/FormServices';
import { addOrderSchema } from '@/validations/add-order.schema';

type FormValues = z.infer<typeof addOrderSchema>;

export default function ServiceSelectForm({ userId }: { userId: string }) {
    const { data: servicesData, isLoading: isServiceLoading } =
        useGetServicesForUserQuery(userId);

    const form = useForm({
        resolver: zodResolver(addOrderSchema),
        defaultValues: { services: [] },
    });

    const onSubmit = async (data: FormValues) => {
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
                        <FormServices
                            servicesData={servicesData?.data}
                            isServiceLoading={isServiceLoading}
                            form={form}
                            userId={userId}
                        />
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
