import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { addOrderSchema } from '@/validations/add-order.schema';
import { z } from 'zod';
import MyDatePicker from '@/components/shared/MyDatePicker';
import { Textarea } from '@/components/ui/textarea';

const returnFormats = ['PSD', 'JPEG', 'PNG', 'GIF'];

export default function FormInformation({
    form,
}: {
    form: UseFormReturn<z.infer<typeof addOrderSchema>>;
}) {
    return (
        <div className="grid grid-cols-2 items-center gap-x-10 gap-y-6">
            {/* User id */}
            <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            User Id <span className="text-destructive">*</span>{' '}
                        </FormLabel>
                        <FormControl>
                            <Input
                                readOnly
                                required
                                placeholder="This is the user id"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Date */}
            <MyDatePicker form={form} />

            {/* Download Link */}
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

            {/* Number of Images */}
            <FormField
                control={form.control}
                name="numberOfImages"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Number of Images{' '}
                            <span className="text-destructive">*</span>{' '}
                        </FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                inputMode="numeric"
                                step="1"
                                min="0"
                                required
                                placeholder="Enter the number of images"
                                value={field.value || ''}
                                onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                }
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Price */}
            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Price <span className="text-destructive">*</span>{' '}
                        </FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                readOnly
                                required
                                placeholder="0"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Return File formate */}
            <FormField
                control={form.control}
                name="returnFormate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Return File Format{' '}
                            <span className="text-destructive">*</span>
                        </FormLabel>

                        <FormControl>
                            <Select
                                onValueChange={(value) => field.onChange(value)}
                                value={field.value}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select the Return File formate" />
                                </SelectTrigger>
                                <SelectContent>
                                    {returnFormats.map((format) => (
                                        <SelectItem key={format} value={format}>
                                            {format}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Instructions */}
            <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>
                            Instructions{' '}
                            <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Instructions for the order"
                                className="resize-none min-h-20"
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
