'use client';

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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Edit2, Loader2, Save } from 'lucide-react';
import React from 'react';
import ApiError from './ApiError';
import toast from 'react-hot-toast';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { useRouter } from 'next/navigation';

export default function AdditionalInformationAlert({
    authToken,
    userPhone,
    userAddress,
    userCompany,
}: {
    authToken: string;
    userPhone: string | null | undefined;
    userCompany: string | null | undefined;
    userAddress: string | null | undefined;
}) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [address, setAddress] = React.useState(userAddress || '');
    const [phone, setPhone] = React.useState(userPhone || '');
    const [company, setCompany] = React.useState(userCompany || '');

    const user = useLoggedInUser();
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const data: Record<string, string> = {};

            if (address && address !== userAddress) data.address = address;
            if (phone && phone !== userPhone) data.phone = phone;
            if (company && company !== userCompany) data.company = company;

            if (Object.keys(data).length === 0) {
                toast.error('No changes to save');
                return;
            }

            setIsLoading(true);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/update-user-info`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        userID: user?.id as string,
                        data,
                    }),
                }
            );

            if (response.ok) {
                toast.success('Profile updated successfully.');
                router.refresh();
            } else {
                toast.error('Failed to update profile.');
            }
        } catch (error) {
            ApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-[calc(100vh-200px)]">
            <div className="flex flex-col gap-3 items-center justify-center h-full">
                <p className="text-destructive">
                    You haven&apos;t set up your address yet. Please update it
                    to access your orders and invoices.
                </p>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Edit2 />
                            Update
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                            <DialogDescription>
                                Make changes to your profile here. Click save
                                when you&apos;re done.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(e.target.value)
                                        }
                                        disabled={!!userAddress}
                                        placeholder="Enter your address here"
                                        required={!userAddress}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={phone}
                                        disabled={!!userPhone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        placeholder="Enter your phone number here"
                                        required={!userPhone}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="company">
                                        Company Name (Optional)
                                    </Label>
                                    <Input
                                        id="company"
                                        name="company"
                                        value={company}
                                        disabled={!!userCompany}
                                        onChange={(e) =>
                                            setCompany(e.target.value)
                                        }
                                        placeholder="Enter your company name here"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="mt-5">
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <Save />
                                    )}
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
