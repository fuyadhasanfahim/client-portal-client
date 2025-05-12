'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

import { Form } from '../ui/form';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

import { useGetServicesForUserQuery } from '@/redux/features/services/servicesApi';
import FormServices from './form-components/FormServices';
import { addOrderSchema } from '@/validations/add-order.schema';
import IService from '@/types/service.interface';
import validateServiceSelection from '@/utils/validateServiceSelection';
import FormInformation from './form-components/FormInformation';
import { Badge } from '../ui/badge';

const StepThreeComponent = () => <div>Step 3: Confirm & Submit</div>;

export default function ServiceSelectForm({ userId }: { userId: string }) {
    const { data: servicesData, isLoading: isServiceLoading } =
        useGetServicesForUserQuery(userId);

    const form = useForm<z.infer<typeof addOrderSchema>>({
        resolver: zodResolver(addOrderSchema),
        defaultValues: { services: [], userId: userId, downloadLink: '' },
    });

    const selectedServices = form.watch('services');
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const isSelected = (id: string) =>
        selectedServices.some((s) => s._id === id);

    const getServiceData = (id: string) =>
        selectedServices.find((s) => s._id === id);

    const toggleService = (service: IService) => {
        const exists = isSelected(service._id!);
        const updated = exists
            ? selectedServices.filter((s) => s._id !== service._id)
            : [
                  ...selectedServices,
                  {
                      _id: service._id,
                      name: service.name,
                      price: service.price,
                      types: [],
                      complexities: [],
                  },
              ];
        form.setValue('services', updated);
    };

    const toggleType = (serviceId: string, type: string) => {
        const updated = selectedServices.map((s) => {
            if (s._id === serviceId) {
                const types = s.types ?? [];
                return {
                    ...s,
                    types: types.some((t) => t.title === type)
                        ? types.filter((t) => t.title !== type)
                        : [...types, { title: type }],
                };
            }
            return s;
        });
        form.setValue('services', updated);
    };

    const updateComplexity = (serviceId: string, value: string) => {
        const [label, priceStr] = value.split(':$');
        const updated = selectedServices.map((s) =>
            s._id === serviceId
                ? {
                      ...s,
                      complexities: [
                          {
                              label,
                              price: parseFloat(priceStr),
                          },
                      ],
                  }
                : s
        );
        form.setValue('services', updated);
    };

    const onSubmit = (data: z.infer<typeof addOrderSchema>) => {
        if (step < totalSteps) {
            setStep((prev) => prev + 1);
        } else {
            console.log('✅ Final submission:', data);
        }
    };

    const allValid = selectedServices.every((s) => {
        const original = servicesData?.data.find(
            (os: IService) => os._id === s._id
        );
        return original
            ? validateServiceSelection(s._id!, original, selectedServices)
            : true;
    });

    const handleBack = () => {
        if (step > 1) setStep((prev) => prev - 1);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Badge variant={'default'}> Step: {step}</Badge>
                <Progress
                    value={(step / totalSteps) * 100}
                    className="w-full"
                />

                {step === 1 && (
                    <div>
                        <h3>
                            Select Services{' '}
                            <span className="text-destructive">*</span>
                        </h3>
                        <FormServices
                            servicesData={servicesData?.data}
                            isServiceLoading={isServiceLoading}
                            form={form}
                            getServiceData={getServiceData}
                            isSelected={isSelected}
                            selectedServices={selectedServices}
                            toggleService={toggleService}
                            toggleType={toggleType}
                            updateComplexity={updateComplexity}
                        />
                    </div>
                )}

                {step === 2 && <FormInformation form={form} />}
                {step === 3 && <StepThreeComponent />}

                <div className="grid grid-cols-3 items-center justify-between gap-6">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleBack}
                        disabled={step === 1}
                    >
                        <ArrowLeft />
                        Back
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setStep(1);
                            form.reset();
                        }}
                    >
                        <RefreshCw />
                        Reset
                    </Button>

                    <Button
                        type="button"
                        onClick={() => {
                            if (
                                step === 1 &&
                                (selectedServices.length === 0 || !allValid)
                            ) {
                                return;
                            }

                            if (step < totalSteps) {
                                setStep((prev) => prev + 1);
                            } else {
                                form.handleSubmit(onSubmit)();
                            }
                        }}
                    >
                        {step === totalSteps ? 'Submit' : 'Next'}
                        <ArrowRight />
                    </Button>
                </div>
            </form>
        </Form>
    );
}
