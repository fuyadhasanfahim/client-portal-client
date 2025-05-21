'use client';

import {
    Card,
    CardContent,
    CardDescription,
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
import { useGetDraftOrderQuery } from '@/redux/features/orders/ordersApi';
import { ChevronRight, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import React from 'react';
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

export default function NewOrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);

    const form = useForm({
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
        },
    });

    const { data, isLoading, isError } = useGetDraftOrderQuery(id);

    let content;

    if (isLoading) {
        content = (
            <Card className="max-w-2xl mx-auto mt-10 min-h-dvh">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="animate-spin" />
                </CardContent>
            </Card>
        );
    } else if (!isLoading && isError) {
        content = (
            <Card className="max-w-2xl mx-auto mt-10 min-h-dvh">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-destructive">
                        Error fetching draft order.
                    </p>
                </CardContent>
            </Card>
        );
    } else if (!isLoading && !isError && !data) {
        content = (
            <Card className="max-w-2xl mx-auto mt-10 min-h-dvh">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-destructive">No draft order found.</p>
                </CardContent>
            </Card>
        );
    } else {
        content = (
            <Card className="max-w-2xl mx-auto mt-10 min-h-dvh">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Upload your images
                    </CardTitle>
                    <CardDescription>
                        Upload the images you need edited. We&apos;ll use these
                        to make sure your edits are priced accurately.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg">Services selected:</h3>

                        <div>
                            {data.data.services.map(
                                (service: {
                                    _id: string;
                                    value: string;
                                    radio: { value: string };
                                }) => (
                                    <div
                                        key={service._id}
                                        className="flex items-center p-2 border-b"
                                    >
                                        <p className="capitalize">
                                            {service.value}
                                        </p>
                                        <span>
                                            <ChevronRight />
                                        </span>
                                        <p className="capitalize">
                                            {service.radio.value}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div>
                        <Form {...form}>
                            <form className="space-y-4">
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
                                                    placeholder="Enter the download link"
                                                    type="url"
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
                                                    placeholder="Enter the images count"
                                                    type="number"
                                                    min={1}
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
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a file format" />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a background option" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {[
                                                            'Transparent',
                                                            'White',
                                                            'Colored',
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

                                <div className="flex items-center justify-between">
                                    <FormField
                                        control={form.control}
                                        name="imageResizing"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Image Resizing
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="Yes" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Yes
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
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

                                    {form.watch('imageResizing') === 'Yes' && (
                                        <div className="space-y-2">
                                            <FormField
                                                control={form.control}
                                                name="width"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-2">
                                                        <FormLabel>
                                                            Width{' '}
                                                            <span className="text-destructive">
                                                                *
                                                            </span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
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
                                                name="height"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-2">
                                                        <FormLabel>
                                                            Height{' '}
                                                            <span className="text-destructive">
                                                                *
                                                            </span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                required
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>

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
                                                    placeholder="Any specific edit instruction here (if applicable)"
                                                    className="min-h-24"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button className='w-full mt-6'>View Prices</Button>
                            </form>
                        </Form>
                    </div>
                </CardContent>
            </Card>
        );
    }
    return content;
}
