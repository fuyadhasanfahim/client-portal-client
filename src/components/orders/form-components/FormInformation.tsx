import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { addOrderSchema } from '@/validations/add-order.schema';
import { z } from 'zod';

export default function FormInformation({
    form,
}: {
    form: UseFormReturn<z.infer<typeof addOrderSchema>>;
}) {
    return (
        <div>
            <FormField
                control={form.control}
                name="downloadLink"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Download Link{' '}
                            <span className="text-destructive">*</span>{' '}
                        </FormLabel>
                        <FormControl>
                            <Input
                                type="url"
                                required
                                placeholder="Enter the drive link"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
