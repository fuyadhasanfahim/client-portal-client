'use client';

import * as React from 'react';
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
import { Button } from '@/components/ui/button';
import { Edit2, Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateUserMutation } from '@/redux/features/users/userApi';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ApiError from './ApiError';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    address: z.string().nonempty('Address is required'),
    phone: z.string().nonempty('Phone is required'),
    company: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdditionalInformationAlert({
    userID,
    userPhone,
    userAddress,
    userCompany,
}: {
    userID: string;
    userPhone: string | null | undefined;
    userCompany: string | null | undefined;
    userAddress: string | null | undefined;
}) {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            address: userAddress || '',
            phone: userPhone || '',
            company: userCompany || '',
        },
    });

    const [updateUserInfo, { isLoading }] = useUpdateUserMutation();

    const router = useRouter();

    const onSubmit = async (data: FormData) => {
        if (
            data.address === (userAddress || '') &&
            data.phone === (userPhone || '') &&
            data.company === (userCompany || '')
        ) {
            toast('No changes detected.');
            return;
        }

        try {
            const response = await updateUserInfo({
                userID,
                data,
            }).unwrap();

            if (response.success) {
                toast.success(response.message);
                form.reset();
                router.refresh();
            } else {
                toast.error('Something went wrong! Please try again later.');
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <div className="w-full h-[calc(100vh-200px)]">
            <div className="flex flex-col gap-3 items-center justify-center h-full">
                <p className="text-destructive text-center text-sm max-w-sm">
                    You haven&apos;t set up your address yet. Please update it
                    to access your orders and invoices.
                </p>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Edit2 className="mr-2 h-4 w-4" />
                            Update
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                            <DialogDescription>
                                Make changes to your profile here. Click save
                                when you&apos;re done.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your address"
                                                    disabled={
                                                        !!userAddress ||
                                                        isLoading
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your phone"
                                                    type="tel"
                                                    disabled={
                                                        !!userPhone || isLoading
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Company Name (optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your company name"
                                                    disabled={
                                                        !!userCompany ||
                                                        isLoading
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="pt-4">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
