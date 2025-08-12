'use client';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
    useCompleteOrderMutation,
    useDeliverOrderMutation,
    useReviewOrderMutation,
} from '@/redux/features/orders/ordersApi';
import { useNewOrderCheckoutMutation } from '@/redux/features/stripe/stripeApi';
import {
    EmbeddedCheckout,
    EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { IconPackage } from '@tabler/icons-react';
import { CheckCircle, CreditCard, Loader, Send, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface OrderDetailsPaymentAndDetailsProps {
    status: string;
    total?: number;
    paymentId?: string;
    paymentStatus?: string;
    role: string;
    orderID: string;
    isRevision?: boolean;
}

export default function OrderDetailsPaymentAndDetails({
    status,
    orderID,
    total,
    paymentId,
    paymentStatus,
    role,
    isRevision = false,
}: OrderDetailsPaymentAndDetailsProps) {
    const [downloadLink, setDownloadLink] = useState<string>('');
    const [instruction, setInstruction] = useState<string>('');
    const [showPaymentReminder, setShowPaymentReminder] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

    const [deliverOrder, { isLoading }] = useDeliverOrderMutation();
    const [reviewOrder, { isLoading: isReviewDone }] = useReviewOrderMutation();
    const [completeOrder, { isLoading: isCompleted }] =
        useCompleteOrderMutation();
    const [newOrderCheckout] = useNewOrderCheckoutMutation();

    const stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );

    const handleDeliverOrder = async () => {
        try {
            const response = await deliverOrder({
                orderID,
                downloadLink,
            }).unwrap();
            if (response.success) {
                setDownloadLink('');
                toast.success(response.message);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const handleReviewOrder = async () => {
        try {
            const res = await reviewOrder({
                orderID,
                instructions: instruction,
            }).unwrap();
            if (res.success) {
                setInstruction('');
                setReviewDialogOpen(false);
                toast.success(res.message);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const handleCompleteOrder = async () => {
        try {
            const res = (await completeOrder(orderID).unwrap)
                ? await completeOrder(orderID).unwrap()
                : await completeOrder({ orderID }).unwrap();
            if (res.success) {
                setCompleteDialogOpen(false);
                toast.success(res.message);
                if (paymentStatus === 'pay-later' && !paymentId) {
                    setShowPaymentReminder(true);
                }
            }
        } catch (error) {
            ApiError(error);
        }
    };

    useEffect(() => {
        if (paymentStatus === 'pay-later') {
            const createSession = async () => {
                try {
                    const res = await newOrderCheckout({
                        orderID,
                        paymentOption: 'pay-now',
                        paymentMethod: 'card-payment',
                    }).unwrap();
                    if (res?.success) setClientSecret(res.data);
                } catch (err) {
                    ApiError(err);
                }
            };
            createSession();
        }
    }, [newOrderCheckout, paymentStatus, orderID]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IconPackage size={24} />
                    <span className="text-2xl">Order Overview</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {status}
                </Badge>
                <p>
                    <strong>Total Price:</strong> ${total || 'N/A'}
                </p>
                <p>
                    <strong>Payment ID:</strong> {paymentId || 'N/A'}
                </p>
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
                                            onClick={handleDeliverOrder}
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
                <CardFooter className="border-t flex flex-col gap-3">
                    {!isRevision && (
                        <Dialog
                            open={reviewDialogOpen}
                            onOpenChange={setReviewDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                                    onClick={() => setReviewDialogOpen(true)}
                                >
                                    <Send className="h-4 w-4" />
                                    Request Revision
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Request a Revision
                                    </DialogTitle>
                                    <DialogDescription>
                                        Tell us what needs to be changed.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-2 py-2">
                                    <Label htmlFor="instruction">
                                        Revision Instructions
                                    </Label>
                                    <Textarea
                                        id="instruction"
                                        placeholder="What needs to be changed?"
                                        value={instruction}
                                        onChange={(e) =>
                                            setInstruction(e.target.value)
                                        }
                                        className="min-h-[140px]"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        className="bg-yellow-500 hover:bg-yellow-600"
                                        disabled={
                                            isReviewDone || !instruction.trim()
                                        }
                                        onClick={handleReviewOrder}
                                    >
                                        {isReviewDone ? (
                                            <Loader className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                        Submit Revision
                                    </Button>
                                    <DialogClose asChild>
                                        <Button variant="secondary">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    <Dialog
                        open={completeDialogOpen}
                        onOpenChange={setCompleteDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => setCompleteDialogOpen(true)}
                            >
                                <CheckCircle className="h-4 w-4" />
                                Confirm Order Completion
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[440px]">
                            <DialogHeader>
                                <DialogTitle>Confirm Completion</DialogTitle>
                                <DialogDescription>
                                    You’re about to mark this order as{' '}
                                    <b>completed</b>. This will close the
                                    revision thread.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    disabled={isCompleted}
                                    onClick={handleCompleteOrder}
                                >
                                    {isCompleted ? (
                                        <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4" />
                                    )}
                                    Confirm Completion
                                </Button>
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            )}

            {role === 'user' &&
                status === 'completed' &&
                paymentStatus === 'pay-later' && (
                    <CardFooter className="border-t px-6 py-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Proceed to Payment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl p-0">
                                <ScrollArea className="h-[75vh]">
                                    <div className="p-6">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl">
                                                Complete Payment
                                            </DialogTitle>
                                            <DialogDescription>
                                                Your order is complete but
                                                pending payment. Please proceed
                                                with the payment.
                                            </DialogDescription>
                                        </DialogHeader>
                                    </div>
                                    {clientSecret ? (
                                        <EmbeddedCheckoutProvider
                                            stripe={stripePromise}
                                            options={{ clientSecret }}
                                        >
                                            <EmbeddedCheckout className="w-full" />
                                        </EmbeddedCheckoutProvider>
                                    ) : (
                                        <div className="flex h-64 items-center justify-center">
                                            <Loader className="h-8 w-8 animate-spin text-purple-500" />
                                        </div>
                                    )}
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                )}

            <Dialog
                open={showPaymentReminder}
                onOpenChange={setShowPaymentReminder}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Payment Reminder</DialogTitle>
                        <DialogDescription>
                            You&apos;ve marked the order as complete, but it
                            seems the payment hasn&apos;t been made yet.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setShowPaymentReminder(false)}
                        >
                            Okay, Got It
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
