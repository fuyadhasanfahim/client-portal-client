import { Checkbox } from '@/components/ui/checkbox';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import IService from '@/types/service.interface';
import { addOrderSchema } from '@/validations/add-order.schema';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

interface FormServicesProps {
    servicesData: IService[];
    isServiceLoading: boolean;
    form: UseFormReturn<z.infer<typeof addOrderSchema>>;
    userId: string;
}

export default function FormServices({
    servicesData,
    isServiceLoading,
    form,
    userId,
}: FormServicesProps) {
    return (
        <div>
            {isServiceLoading ? (
                <Skeleton className="h-4 max-w-md" />
            ) : servicesData.length === 0 ? (
                <div>No service found</div>
            ) : (
                <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                        <>
                            {servicesData.map(
                                (service: IService, index: number) => (
                                    <FormItem key={index}>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value.includes(
                                                    service
                                                )}
                                                onCheckedChange={(checked) => {
                                                    const updatedServices =
                                                        checked
                                                            ? [
                                                                  ...field.value,
                                                                  service,
                                                              ]
                                                            : field.value.filter(
                                                                  (
                                                                      s: IService
                                                                  ) =>
                                                                      s !==
                                                                      service
                                                              );
                                                    field.onChange(
                                                        updatedServices
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                {service.name}
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )
                            )}
                        </>
                    )}
                />
            )}
        </div>
    );
}
