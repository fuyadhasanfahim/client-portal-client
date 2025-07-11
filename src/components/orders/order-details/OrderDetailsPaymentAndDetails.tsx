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
import { IconLoader, IconPackage } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface OrderDetailsPaymentAndDetailsProps {
    status: string;
    total?: number;
    paymentId?: string;
    paymentStatus?: string;
    role: string;
    orderID: string;
    userID: string;
}

export default function OrderDetailsPaymentAndDetails({
    status,
    orderID,
    userID,
    total,
    paymentId,
    paymentStatus,
    role,
}: OrderDetailsPaymentAndDetailsProps) {
    const [downloadLink, setDownloadLink] = useState<string>('');
    const [instruction, setInstruction] = useState<string>('');
    const [reviewOrComplete, setReviewOrComplete] = useState<string>('');
    const [showPaymentReminder, setShowPaymentReminder] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    const [deliverOrder, { isLoading }] = useDeliverOrderMutation();
    const [reviewOrder, { isLoading: isReviewDone }] = useReviewOrderMutation();
    const [completeOrder, { isLoading: isCompleted }] =
        useCompleteOrderMutation();

    const handleDeliverOrder = async ({
        order_id,
        order_status,
        user_id,
        download_link,
    }: {
        order_id: string;
        order_status: string;
        user_id: string;
        download_link: string;
    }) => {
        try {
            const response = await deliverOrder({
                order_id,
                order_status,
                user_id,
                download_link,
            });

            if (response.data.success) {
                setDownloadLink('');
                toast.success(response.data.message);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const handleReviewOrder = async ({
        order_id,
        sender_id,
        sender_role,
        message,
    }: {
        order_id: string;
        sender_id: string;
        sender_role: string;
        message: string;
    }) => {
        try {
            const response = await reviewOrder({
                order_id,
                sender_id,
                sender_role,
                message,
            });

            if (response.data.success) {
                setInstruction('');
                toast.success(response.data.message);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const handleCompleteOrder = async ({
        order_id,
        user_id,
    }: {
        order_id: string;
        user_id: string;
    }) => {
        try {
            const response = await completeOrder({
                order_id,
                user_id,
            });

            if (response.data.success) {
                setInstruction('');
                toast.success(response.data.message);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const [newOrderCheckout] = useNewOrderCheckoutMutation();

    useEffect(() => {
        if (paymentStatus === 'pay-later') {
            const createSession = async () => {
                try {
                    const res = await newOrderCheckout({
                        orderID,
                        paymentOption: 'pay-now',
                        paymentMethod: 'card-payment',
                    }).unwrap();

                    if (res?.success) {
                        setClientSecret(res.data);
                    }
                } catch (err) {
                    ApiError(err);
                }
            };

            createSession();
        }
    }, [newOrderCheckout, paymentStatus, orderID]);

    const stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IconPackage size={24} />{' '}
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
                    <CardFooter>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full" disabled={isLoading}>
                                    Deliver Now
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Fill the input</DialogTitle>
                                    <DialogDescription>
                                        <Input
                                            placeholder="Enter download link"
                                            value={downloadLink}
                                            onChange={(e) =>
                                                setDownloadLink(e.target.value)
                                            }
                                            type="url"
                                            required
                                        />
                                    </DialogDescription>
                                </DialogHeader>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button
                                            type="submit"
                                            onClick={() =>
                                                handleDeliverOrder({
                                                    order_id: orderID,
                                                    order_status: 'Delivered',
                                                    user_id: userID,
                                                    download_link: downloadLink,
                                                })
                                            }
                                        >
                                            Deliver
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                )}

            {role === 'user' && status === 'delivered' && (
                <CardFooter>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                className="w-full"
                                disabled={isReviewDone || isCompleted}
                            >
                                Complete/Request Revision
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Fill the input</DialogTitle>
                                <DialogDescription className="space-y-6">
                                    <RadioGroup
                                        className="mt-4 flex items-center gap-6"
                                        value={reviewOrComplete}
                                        onValueChange={(value) =>
                                            setReviewOrComplete(value)
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem
                                                value="in-revision"
                                                id="in-revision"
                                            />
                                            <Label htmlFor="in-revision">
                                                Request Revision
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem
                                                value="Complete"
                                                id="Complete"
                                            />
                                            <Label htmlFor="Complete">
                                                Complete Order
                                            </Label>
                                        </div>
                                    </RadioGroup>

                                    {reviewOrComplete === 'in-revision' && (
                                        <div className="grid w-full items-center gap-3">
                                            <Label htmlFor="instruction">
                                                Instruction
                                            </Label>
                                            <Textarea
                                                id="instruction"
                                                placeholder="Enter the review instructions"
                                                value={instruction}
                                                onChange={(e) =>
                                                    setInstruction(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    )}
                                </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                                <DialogClose asChild>
                                    {reviewOrComplete === 'in-revision' ? (
                                        <Button
                                            type="submit"
                                            disabled={isReviewDone}
                                            onClick={() => {
                                                handleReviewOrder({
                                                    order_id: orderID,
                                                    sender_id: userID,
                                                    message: instruction,
                                                    sender_role: role,
                                                });
                                            }}
                                        >
                                            Request for review
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isCompleted}
                                            onClick={() => {
                                                handleCompleteOrder({
                                                    order_id: orderID,
                                                    user_id: userID,
                                                });

                                                if (
                                                    reviewOrComplete ===
                                                        'complete' &&
                                                    paymentStatus ===
                                                        'pay-later' &&
                                                    !paymentId
                                                ) {
                                                    setShowPaymentReminder(
                                                        true
                                                    );
                                                }
                                            }}
                                        >
                                            Complete Order
                                        </Button>
                                    )}
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            )}

            {role === 'user' &&
                status === 'completed' &&
                paymentStatus === 'pay-later' && (
                    <CardFooter>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full">
                                    Proceed to Payment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="px-0">
                                <ScrollArea className="h-[75vh]">
                                    <DialogHeader className="p-6">
                                        <DialogTitle>Payment</DialogTitle>
                                        <DialogDescription>
                                            You&apos;ve marked the order as
                                            complete, but it seems the payment
                                            has not been made yet.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {clientSecret ? (
                                        <EmbeddedCheckoutProvider
                                            stripe={stripePromise}
                                            options={{ clientSecret }}
                                        >
                                            <EmbeddedCheckout className="w-full" />
                                        </EmbeddedCheckoutProvider>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <IconLoader className="animate-spin" />
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
                            variant={'secondary'}
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
