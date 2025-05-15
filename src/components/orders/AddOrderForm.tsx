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
import { toast } from 'sonner';
import FormPayments from './form-components/FormPayments';
import { v4 } from 'uuid';

export default function ServiceSelectForm({ userId }: { userId: string }) {
    const { data: servicesData, isLoading: isServiceLoading } =
        useGetServicesForUserQuery(userId);
    const [generatedOrderId, setGeneratedOrderId] = useState(() => v4());

    const form = useForm<z.infer<typeof addOrderSchema>>({
        resolver: zodResolver(addOrderSchema),
        defaultValues: {
            services: [],
            userId: userId,
            orderId: generatedOrderId,
            downloadLink: '',
            date: new Date(),
            numberOfImages: 0,
            price: 0,
            returnFormate: '',
            instructions: '',
            paymentOption: 'Pay Later',
            paymentMethod: '',
        },
    });

    const selectedServices = form.watch('services');
    const numberOfImages = form.watch('numberOfImages');
    const approximatePrice =
        selectedServices.reduce((sum, service) => {
            const price = service.complexity?.price ?? service.price ?? 0;
            return sum + price;
        }, 0) * numberOfImages;

    form.setValue('price', approximatePrice);

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
                      complexity: {
                          label: '',
                          price: 0,
                      },
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
        const parsedPrice = parseFloat(priceStr);

        const updated = selectedServices.map((s) =>
            s._id === serviceId
                ? {
                      ...s,
                      complexity: {
                          label,
                          price: parsedPrice,
                      },
                  }
                : s
        );

        form.setValue('services', updated);
    };

    const allValid = selectedServices.every((s) => {
        const original = servicesData?.data.find(
            (os: IService) => os._id === s._id
        );
        return original
            ? validateServiceSelection(s._id!, original, selectedServices)
            : true;
    });

    const isStepValidSilent = () => {
        if (step === 1) return selectedServices.length > 0 && allValid;

        if (step === 2) {
            return (
                !!form.watch('userId')?.trim() &&
                !!form.watch('downloadLink')?.trim() &&
                !!form.watch('numberOfImages') &&
                !!form.watch('instructions')?.trim() &&
                !!form.watch('returnFormate')?.trim()
            );
        }

        if (step === 3) {
            return !!form.watch('paymentOption');
        }

        return true;
    };

    const validateStepWithToast = () => {
        if (step === 1) {
            if (selectedServices.length === 0) {
                toast.error(
                    'Step 1 Error: Please select at least one service.'
                );
                return false;
            }
            if (!allValid) {
                toast.error('Step 1 Error: Service selection is invalid.');
                return false;
            }
            return true;
        }

        if (step === 2) {
            const missingFields: string[] = [];
            if (!form.watch('userId')?.trim()) missingFields.push('User ID');
            if (!form.watch('downloadLink')?.trim())
                missingFields.push('Download Link');
            if (!form.watch('numberOfImages'))
                missingFields.push('Number of Images');
            if (!form.watch('instructions')?.trim())
                missingFields.push('Instructions');
            if (!form.watch('returnFormate')?.trim())
                missingFields.push('Return Format');

            if (missingFields.length > 0) {
                toast.error(
                    `Step 2 Error: ${missingFields.join(', ')} ${
                        missingFields.length > 1 ? 'are' : 'is'
                    } required`
                );
                return false;
            }

            return true;
        }

        if (step === 3) {
            const missingFields: string[] = [];
            if (!form.watch('paymentOption'))
                missingFields.push('Payment Option');

            if (missingFields.length > 0) {
                toast.error(
                    `Step 3 Error: ${missingFields.join(', ')} ${
                        missingFields.length > 1 ? 'are' : 'is'
                    } required`
                );
                return false;
            }

            return true;
        }

        return true;
    };

    const getButtonLabel = () => {
        if (step < totalSteps) return 'Next';
        if (form.watch('paymentOption') === 'Pay Later') return 'Submit';
        if (
            form.watch('paymentOption') === 'Pay Now' &&
            form.watch('paymentMethod')
        )
            return 'Save and Proceed to Payment';
        return 'Next';
    };

    const onSubmit = (data: z.infer<typeof addOrderSchema>) => {
        console.log(data);

        if (step < totalSteps) {
            setStep((prev) => prev + 1);
        } else {
            console.log('✅ Final submission:', data);
        }
    };

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
                {step === 3 && <FormPayments form={form} />}

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
                            setGeneratedOrderId(v4());
                            form.reset({
                                ...form.getValues(),
                                services: [],
                                userId,
                                orderId: generatedOrderId,
                                downloadLink: '',
                                date: new Date(),
                                numberOfImages: 0,
                                price: 0,
                                returnFormate: '',
                                instructions: '',
                                paymentOption: 'Pay Later',
                                paymentMethod: '',
                            });
                            setStep(1);
                        }}
                    >
                        <RefreshCw />
                        Reset
                    </Button>

                    <Button
                        type="button"
                        disabled={!isStepValidSilent()}
                        onClick={() => {
                            if (!validateStepWithToast()) return;

                            if (step < totalSteps) {
                                setStep((prev) => prev + 1);
                            } else {
                                onSubmit(form.getValues());
                            }
                        }}
                    >
                        {getButtonLabel()}
                        <ArrowRight />
                    </Button>
                </div>
            </form>
        </Form>
    );
}
