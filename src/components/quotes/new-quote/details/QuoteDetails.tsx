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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader, Trash2 } from 'lucide-react';
import { useNewQuoteMutation } from '@/redux/features/quotes/quoteApi';
import toast from 'react-hot-toast';
import ApiError from '@/components/shared/ApiError';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/shared/multi-select';
import { Checkbox } from '@/components/ui/checkbox';
import { IOrderDetails } from '@/types/order.interface';
import { DateAndTimePicker } from '@/components/shared/DateAndTimePicker';
import useLoggedInUser from '@/utils/getLoggedInUser';
import FileUploadField from '@/components/orders/new-order/FileUploadField';
import { NewQuoteDetailsSchema } from '@/validations/quote-details.schema';

export default function QuoteDetails({ quoteID }: { quoteID: string }) {
    const { user } = useLoggedInUser();

    const form = useForm<z.infer<typeof NewQuoteDetailsSchema>>({
        resolver: zodResolver(NewQuoteDetailsSchema),
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

    const [newQuote, { isLoading }] = useNewQuoteMutation();

    const onSubmit = async (data: Partial<IOrderDetails>) => {
        try {
            const response = await newQuote({
                userID: user.userID,
                quoteStage: 'details-provided',
                quoteID,
                details: data as IOrderDetails,
            }).unwrap();

            if (response.success) {
                toast.success('Details saved. Redirecting...');
                router.push('/quotes');
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const resizingEnabled = form.watch('imageResizing');
    const backgroundOption = form.watch('backgroundOption');

    return (
        <Card>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit, (error) =>
                        console.log(error)
                    )}
                    className="space-y-6"
                >
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
                        <FileUploadField
                            label="Download Link"
                            name="downloadLink"
                            quoteID={quoteID}
                            userID={user.userID}
                            required
                            description="Upload your images or provide a download link"
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
                                                {(field.value ?? []).map(
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
                                                                            ...(field.value ??
                                                                                []),
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
                                                                            ...(field.value ??
                                                                                []),
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
                                                                            ...(field.value ??
                                                                                []),
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
                                                            ...(field.value ??
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

                        <FileUploadField
                            label="Source File Link"
                            name="sourceFileLink"
                            quoteID={quoteID}
                            userID={user.userID}
                            required={false}
                            isDownloadLink={false}
                            description="Optional: Upload source files like PSD, AI, etc."
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
                            {isLoading ? 'Loading...' : 'Complete Quote'}
                            {isLoading ? (
                                <Loader className="animate-spin" />
                            ) : (
                                <ArrowRight />
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
