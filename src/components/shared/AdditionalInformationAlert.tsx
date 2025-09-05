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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ApiError from './ApiError';
import { useRouter } from 'next/navigation';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { ISanitizedUser } from '@/types/user.interface';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

const formSchema = z.object({
    address: z.string().nonempty('Address is required'),
    phone: z.string().nonempty('Phone is required'),
    currency: z.string().nonempty('Currency is required'),
    company: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const currencies = {
    USD: { name: 'US Dollar', symbol: '$', label: 'USD — US Dollar ($)' },
    EUR: { name: 'Euro', symbol: '€', label: 'EUR — Euro (€)' },
    GBP: {
        name: 'British Pound',
        symbol: '£',
        label: 'GBP — British Pound (£)',
    },
    JPY: { name: 'Japanese Yen', symbol: '¥', label: 'JPY — Japanese Yen (¥)' },
    AUD: {
        name: 'Australian Dollar',
        symbol: '$',
        label: 'AUD — Australian Dollar ($)',
    },
    CAD: {
        name: 'Canadian Dollar',
        symbol: '$',
        label: 'CAD — Canadian Dollar ($)',
    },
    CHF: { name: 'Swiss Franc', symbol: 'Fr', label: 'CHF — Swiss Franc (Fr)' },
    CNY: { name: 'Chinese Yuan', symbol: '¥', label: 'CNY — Chinese Yuan (¥)' },
    HKD: {
        name: 'Hong Kong Dollar',
        symbol: '$',
        label: 'HKD — Hong Kong Dollar ($)',
    },
    SGD: {
        name: 'Singapore Dollar',
        symbol: '$',
        label: 'SGD — Singapore Dollar ($)',
    },
    BRL: {
        name: 'Brazilian Real',
        symbol: 'R$',
        label: 'BRL — Brazilian Real (R$)',
    },
    MXN: { name: 'Mexican Peso', symbol: '$', label: 'MXN — Mexican Peso ($)' },
};

export default function AdditionalInformationAlert() {
    const { user } = useLoggedInUser();
    const { userID, address, phone, company, currency } =
        user as ISanitizedUser;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            address: address || '',
            phone: phone || '',
            company: company || '',
            currency: currency || '',
        },
    });

    const [updateUserInfo, { isLoading }] = useUpdateUserMutation();

    const router = useRouter();

    const onSubmit = async (data: FormData) => {
        if (
            data.address === (address || '') &&
            data.phone === (phone || '') &&
            data.company === (company || '') &&
            data.currency === (currency || '')
        ) {
            toast.error('No changes detected.');
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
                window.location.reload();
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
                <p className="text-destructive text-center max-w-sm">
                    We need some more information about you. Please be patient
                    and give the required information.
                </p>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size={'lg'} variant="secondary">
                            <Edit2 />
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
                                                        !!address || isLoading
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
                                                        !!phone || isLoading
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
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Select Currency
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a currency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(
                                                        currencies
                                                    ).map(([code, c]) => (
                                                        <SelectItem
                                                            key={code}
                                                            value={code}
                                                        >
                                                            {c.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                We’ll save the ISO code (e.g.,
                                                USD, EUR).
                                            </FormDescription>
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
                                                        !!company || isLoading
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
