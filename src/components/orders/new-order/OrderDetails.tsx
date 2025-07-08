'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { boolean, z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trash2 } from 'lucide-react';
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
import { MultiSelect } from '@/components/shared/multi-select';
import { Checkbox } from '@/components/ui/checkbox';
import { IOrderDetails } from '@/types/order.interface';
import { DateAndTimePicker } from '@/components/shared/DateAndTimePicker';

type OrderDetailsProps = {
    orderID: string;
    userID: string;
};

export default function OrderDetails({ orderID, userID }: OrderDetailsProps) {
    const form = useForm<z.infer<typeof NewOrderDetailsSchema>>({
        resolver: zodResolver(NewOrderDetailsSchema),
        defaultValues: {
            downloadLink: '',
            sourceFileLink: '',
            images: 0,
            returnFileFormat: [],
            backgroundOption: [],
            backgroundColor: [],
            imageResizing: false,
            width: 0,
            height: 0,
            instructions: '',
            deliveryDate: new Date(),
        },
    });

    const router = useRouter();

    const [newOrder, { isLoading }] = useNewOrderMutation();

    const onSubmit = async (data: z.infer<typeof NewOrderDetailsSchema>) => {
        try {
            const response = await newOrder({
                orderStage: 'details-provided',
                userID,
                orderID,
                details: data as IOrderDetails,
            });

            if (response?.data?.success) {
                toast.success('Details saved. Redirecting...');
                router.push(`/orders/new-order/review/${orderID}`);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const resizingEnabled = form.watch('imageResizing');
    const backgroundOption = form.watch('backgroundOption');

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

                        <DateAndTimePicker
                            control={form.control}
                            name="deliveryDate"
                            label="Delivery date and time"
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
                                        <MultiSelect
                                            selected={field.value}
                                            options={[
                                                'JPEG',
                                                'PNG',
                                                'PSD',
                                                'EPS',
                                                'AI',
                                                'GIF',
                                                'PDF',
                                            ].map((format) => ({
                                                label: format,
                                                value: format,
                                            }))}
                                            {...field}
                                            className="sm:w-[510px]"
                                        />
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
                                        <MultiSelect
                                            selected={field.value}
                                            options={[
                                                'Transparent',
                                                'White',
                                                'Colored',
                                            ].map((option) => ({
                                                label: option,
                                                value: option,
                                            }))}
                                            {...field}
                                            className="sm:w-[510px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {backgroundOption?.includes('Colored') && (
                            <FormField
                                control={form.control}
                                name="backgroundColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Background Colors (Hex codes){' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="space-y-2">
                                                {field.value?.map(
                                                    (color, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <input
                                                                type="color"
                                                                value={color}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newColors =
                                                                        [
                                                                            ...field.value,
                                                                        ];
                                                                    newColors[
                                                                        index
                                                                    ] =
                                                                        e.target.value;
                                                                    field.onChange(
                                                                        newColors
                                                                    );
                                                                }}
                                                                className="h-10 w-10 !rounded-full p-0 border-none"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={color}
                                                                placeholder="#FFFFFF"
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newColors =
                                                                        [
                                                                            ...field.value,
                                                                        ];
                                                                    newColors[
                                                                        index
                                                                    ] =
                                                                        e.target.value;
                                                                    field.onChange(
                                                                        newColors
                                                                    );
                                                                }}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="bg-red-50 text-destructive border-destructive"
                                                                onClick={() => {
                                                                    const newColors =
                                                                        [
                                                                            ...field.value,
                                                                        ];
                                                                    newColors.splice(
                                                                        index,
                                                                        1
                                                                    );
                                                                    field.onChange(
                                                                        newColors
                                                                    );
                                                                }}
                                                            >
                                                                <Trash2 />
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        field.onChange([
                                                            ...(field.value ||
                                                                []),
                                                            '#FFFFFF',
                                                        ]);
                                                    }}
                                                >
                                                    Add Color
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="imageResizing"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image Resizing</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="resizing-yes"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <Label htmlFor="resizing-yes">
                                                Yes
                                            </Label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {resizingEnabled && (
                            <div className="grid grid-cols-2 items-center gap-6">
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
                            name="sourceFileLink"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source File Link</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter the source file link"
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
