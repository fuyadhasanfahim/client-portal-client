import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

export default function OrderDetails({
    form,
}: {
    form: UseFormReturn<{
        downloadLink: string;
        images: string;
        returnFileFormat: string;
        backgroundOption: string;
        imageResizing: string;
        width: number;
        height: number;
        instructions: string;
        supportingFileDownloadLink: string;
    }>;
}) {
    return (
        <Card className="min-h-dvh">
            <CardHeader>
                <CardTitle className="text-2xl">Upload your images</CardTitle>
                <CardDescription>
                    Upload the images you need edited. We&apos;ll use these to
                    make sure your edits are priced accurately.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                                                onValueChange={field.onChange}
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
                                                onValueChange={field.onChange}
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

                            <div className="flex items-center gap-16">
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
                                    <div className="space-y-2 mt-4">
                                        <FormField
                                            control={form.control}
                                            name="width"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center gap-2">
                                                    <FormLabel>
                                                        Width:
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
                                                        Height:
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

                            <Button className="w-full mt-6">
                                View Prices
                                <ArrowRight />
                            </Button>
                        </form>
                    </Form>
                </div>
            </CardContent>
        </Card>
    );
}
