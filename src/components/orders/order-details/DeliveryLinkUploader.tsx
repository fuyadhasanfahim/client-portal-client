/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Truck } from 'lucide-react';
import ApiError from '@/components/shared/ApiError';
import { useDeliverOrderMutation } from '@/redux/features/orders/ordersApi';
import FileUploadField from '../new-order/FileUploadField';

type FormValues = {
    downloadLink: string;
    images: number;
};

export default function DeliveryLinkUploader({
    orderID,
    userID,
}: {
    orderID: string;
    userID: string;
}) {
    const methods = useForm<FormValues>({
        defaultValues: { downloadLink: '', images: 0 },
    });
    const { handleSubmit, watch, reset } = methods;

    const [deliverDialogOpen, setDeliverDialogOpen] = useState(false);
    const [deliveryTitle, setDeliveryTitle] = useState(''); // optional pretty folder name

    const [deliverOrder, { isLoading }] = useDeliverOrderMutation();
    const downloadLink = watch('downloadLink');

    async function onSubmit(values: FormValues) {
        try {
            if (!values.downloadLink?.trim()) {
                toast.error('Please upload files or paste a link.');
                return;
            }
            const response = await deliverOrder({
                orderID,
                deliveryLink: values.downloadLink, // this will be the zip route if you uploaded files
            }).unwrap();

            if ((response as any)?.success) {
                toast.success(
                    (response as any)?.message || 'Delivery submitted'
                );
                reset();
                setDeliveryTitle('');
                setDeliverDialogOpen(false);
            }
        } catch (err) {
            ApiError(err);
        }
    }

    return (
        <FormProvider {...methods}>
            <Dialog
                open={deliverDialogOpen}
                onOpenChange={setDeliverDialogOpen}
            >
                <DialogTrigger asChild>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white mx-6"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader className="h-4 w-4 animate-spin" />
                                Processing…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Deliver Now
                            </span>
                        )}
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[620px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg">
                            Add Delivery Details
                        </DialogTitle>
                        <DialogDescription>
                            Upload your files (recommended) or paste an external
                            link. If you upload, we’ll create a delivery folder
                            and give you a single auto-download link (.zip).
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                    >
                        {/* Optional Delivery Title (used in the S3 folder path when mode="delivery") */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="deliveryTitle"
                                className="text-sm font-medium"
                            >
                                Delivery Title (optional)
                            </Label>
                            <Input
                                id="deliveryTitle"
                                placeholder="e.g. first-revision, final-files"
                                value={deliveryTitle}
                                onChange={(e) =>
                                    setDeliveryTitle(e.target.value)
                                }
                            />
                        </div>

                        <FileUploadField
                            label="Delivery files or link"
                            description="Upload any files (max ~5GB each) OR toggle to paste an external link."
                            userID={userID}
                            orderID={orderID}
                            required
                            mode="delivery" // <-- IMPORTANT: delivery mode
                            title={deliveryTitle} // optional; falls back to time if empty
                            uploader="admin" // optional; server should still verify role
                        />

                        {/* Preview of the final link that will be sent to the user */}
                        {downloadLink ? (
                            <p className="text-xs text-muted-foreground break-all">
                                Will send: {downloadLink}
                            </p>
                        ) : null}

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setDeliverDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                ) : null}
                                <span className="ml-2">Confirm Delivery</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </FormProvider>
    );
}
