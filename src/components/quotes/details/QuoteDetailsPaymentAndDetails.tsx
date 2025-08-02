import ApiError from '@/components/shared/ApiError';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
    useCompleteQuoteMutation,
    useDeliverQuoteMutation,
    useReviewQuoteMutation,
} from '@/redux/features/quotes/quoteApi';
import { loadStripe } from '@stripe/stripe-js';
import { IconPackage } from '@tabler/icons-react';
import { CheckCircle, Loader, RefreshCw, Send, Truck } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface QuoteDetailsPaymentAndDetailsProps {
    status: string;
    role: string;
    quoteID: string;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function OrderDetailsPaymentAndDetails({
    status,
    quoteID,
    role,
    setIsSubmitting,
}: QuoteDetailsPaymentAndDetailsProps) {
    const [downloadLink, setDownloadLink] = useState<string>('');
    const [instruction, setInstruction] = useState<string>('');
    const [reviewOrComplete, setReviewOrComplete] = useState<string>('');

    const [deliverQuote, { isLoading }] = useDeliverQuoteMutation();
    const [reviewQuote, { isLoading: isReviewDone }] = useReviewQuoteMutation();
    const [completeQuote, { isLoading: isCompleted }] =
        useCompleteQuoteMutation();

    const handleDeliverQuote = async () => {
        try {
            setIsSubmitting(true);

            const response = await deliverQuote({
                quoteID,
                downloadLink,
            }).unwrap();

            if (response.success) {
                setDownloadLink('');
                toast.success(response.message);
            }
        } catch (error) {
            ApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReviewQuote = async () => {
        try {
            setIsSubmitting(true);

            const response = await reviewQuote({
                quoteID,
                instructions: instruction,
            });

            if (response.data.success) {
                setInstruction('');
                toast.success(response.data.message);
            }
        } catch (error) {
            ApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteQuote = async () => {
        try {
            setIsSubmitting(true);

            const response = await completeQuote({
                quoteID,
            });

            if (response.data.success) {
                setInstruction('');
                toast.success(response.data.message);
            }
        } catch (error) {
            ApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IconPackage size={24} />{' '}
                    <span className="text-2xl">Quote Overview</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {status}
                </Badge>
            </CardContent>
            {role !== 'user' &&
                (status === 'in-progress' || status === 'in-revision') && (
                    <CardFooter className="border-t">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader className="h-4 w-4 animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-4 w-4" />
                                            Deliver Now
                                        </div>
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="text-lg">
                                        Add Delivery Details
                                    </DialogTitle>
                                    <DialogDescription>
                                        Provide the download link for the
                                        completed work
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="downloadLink"
                                            className="text-sm font-medium"
                                        >
                                            Download Link
                                        </Label>
                                        <Input
                                            id="downloadLink"
                                            placeholder="https://example.com/download"
                                            value={downloadLink}
                                            onChange={(e) =>
                                                setDownloadLink(e.target.value)
                                            }
                                            type="url"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button
                                            type="submit"
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                            onClick={handleDeliverQuote}
                                        >
                                            Confirm Delivery
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                )}

            {role === 'user' && status === 'delivered' && (
                <CardFooter className="border-t">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={isReviewDone || isCompleted}
                            >
                                {isReviewDone || isCompleted ? (
                                    <div className="flex items-center gap-2">
                                        <Loader className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Complete/Request Revision
                                    </div>
                                )}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-lg">
                                    Quote Feedback
                                </DialogTitle>
                                <DialogDescription>
                                    {reviewOrComplete === 'in-revision'
                                        ? 'Provide details for revision'
                                        : 'Confirm Quote completion'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <RadioGroup
                                    value={reviewOrComplete}
                                    onValueChange={setReviewOrComplete}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div>
                                        <RadioGroupItem
                                            value="in-revision"
                                            id="in-revision"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="in-revision"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500"
                                        >
                                            <RefreshCw className="mb-2 h-6 w-6 text-yellow-500" />
                                            Request Revision
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem
                                            value="complete"
                                            id="complete"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="complete"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500"
                                        >
                                            <CheckCircle className="mb-2 h-6 w-6 text-emerald-500" />
                                            Complete Quote
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {reviewOrComplete === 'in-revision' && (
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="instruction"
                                            className="text-sm font-medium"
                                        >
                                            Revision Instructions
                                        </Label>
                                        <Textarea
                                            id="instruction"
                                            placeholder="What needs to be changed?"
                                            value={instruction}
                                            onChange={(e) =>
                                                setInstruction(e.target.value)
                                            }
                                            className="min-h-[120px]"
                                        />
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    {reviewOrComplete === 'in-revision' && (
                                        <Button
                                            type="submit"
                                            className="bg-yellow-500 hover:bg-yellow-600"
                                            disabled={
                                                isReviewDone || !instruction
                                            }
                                            onClick={handleReviewQuote}
                                        >
                                            <Send className="h-4 w-4" />
                                            Submit Revision Request
                                        </Button>
                                    )}
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            )}
        </Card>
    );
}
