'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { NewOrderDetailsSchema } from '@/validations/order-details.schema';
import { useNewOrderMutation } from '@/redux/features/orders/ordersApi';
import toast from 'react-hot-toast';
import ApiError from '@/components/shared/ApiError';
import { useRouter } from 'next/navigation';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { IconCalendar } from '@tabler/icons-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type OrderDetailsProps = {
    id: string;
};

export default function OrderDetails({ id }: OrderDetailsProps) {
    const form = useForm<z.infer<typeof NewOrderDetailsSchema>>({
        resolver: zodResolver(NewOrderDetailsSchema),
        defaultValues: {
            downloadLink: '',
            images: 0,
            returnFileFormat: '',
            backgroundOption: '',
            imageResizing: 'No',
            width: 0,
            height: 0,
            instructions: '',
            supportingFileDownloadLink: '',
            deliveryDate: new Date(),
        },
    });

    const router = useRouter();

    const [newOrder, { isLoading }] = useNewOrderMutation();

    const onSubmit = async (data: z.infer<typeof NewOrderDetailsSchema>) => {
        try {
            const response = await newOrder({
                data: {
                    orderID: id,
                    ...data,
                },
            });

            if (response?.data?.success) {
                toast.success('Details saved. Redirecting...');
                router.push(`/orders/new-order/${id}/review`);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const resizingEnabled = form.watch('imageResizing') === 'Yes';

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Order Details
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Please fill in all{' '}
                            <span className="text-destructive">*</span> required
                            fields to help us deliver your edits exactly as you
                            envision.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="downloadLink"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Download Link{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="Enter the download link"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="images"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Images{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter Image count"
                                            type="number"
                                            value={field.value || ''}
                                            step="1"
                                            min="0"
                                            onChange={(e) =>
                                                field.onChange(
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="deliveryDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2">
                                    <FormLabel>Delivery Date & Time</FormLabel>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'pl-3 text-left font-normal',
                                                        !field.value &&
                                                            'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            'PPPp'
                                                        )
                                                    ) : (
                                                        <span>
                                                            Pick a date & time
                                                        </span>
                                                    )}
                                                    <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>

                                        <PopoverContent
                                            className="space-y-2"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    const current =
                                                        field.value ||
                                                        new Date();
                                                    const newDate = new Date(
                                                        date!
                                                    );
                                                    newDate.setHours(
                                                        current.getHours()
                                                    );
                                                    newDate.setMinutes(
                                                        current.getMinutes()
                                                    );
                                                    field.onChange(newDate);
                                                }}
                                                disabled={(date) =>
                                                    date <
                                                    new Date(
                                                        new Date().setHours(
                                                            0,
                                                            0,
                                                            0,
                                                            0
                                                        )
                                                    )
                                                }
                                                initialFocus
                                            />
                                            <Separator />
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm">
                                                    Time:
                                                </Label>
                                                <Input
                                                    type="time"
                                                    className="text-sm"
                                                    value={
                                                        field.value
                                                            ? format(
                                                                  field.value,
                                                                  'HH:mm'
                                                              )
                                                            : ''
                                                    }
                                                    onChange={(e) => {
                                                        const [hours, minutes] =
                                                            e.target.value.split(
                                                                ':'
                                                            );
                                                        const updated =
                                                            new Date(
                                                                field.value ||
                                                                    new Date()
                                                            );
                                                        updated.setHours(
                                                            +hours
                                                        );
                                                        updated.setMinutes(
                                                            +minutes
                                                        );
                                                        field.onChange(updated);
                                                    }}
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="returnFileFormat"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Return File Format{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a file format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    'JPEG',
                                                    'PNG',
                                                    'PSD',
                                                    'EPS',
                                                    'AI',
                                                    'GIF',
                                                    'PDF',
                                                ].map((format) => (
                                                    <SelectItem
                                                        key={format}
                                                        value={format}
                                                    >
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

                        <FormField
                            control={form.control}
                            name="backgroundOption"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Background Option{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a background option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    'Transparent',
                                                    'White',
                                                    'Colored',
                                                ].map((option) => (
                                                    <SelectItem
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="imageResizing"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image Resizing</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex gap-8"
                                        >
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <RadioGroupItem value="Yes" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Yes
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <RadioGroupItem value="No" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    No
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {resizingEnabled && (
                            <div className="flex gap-6">
                                <FormField
                                    control={form.control}
                                    name="width"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Width{' '}
                                                <span className="text-xs text-destructive">
                                                    (px)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter Width"
                                                    type="number"
                                                    value={field.value || ''}
                                                    step="1"
                                                    min="0"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
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
                                <FormField
                                    control={form.control}
                                    name="height"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Height{' '}
                                                <span className="text-xs text-destructive">
                                                    (px)
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter Height"
                                                    type="number"
                                                    value={field.value || ''}
                                                    step="1"
                                                    min="0"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
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
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="supportingFileDownloadLink"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Supporting File Download Link
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter the supporting file link"
                                            required={false}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="instructions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Instructions{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any specific edit instructions"
                                            className="min-h-24"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>

                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Submitting...' : 'View Prices'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
