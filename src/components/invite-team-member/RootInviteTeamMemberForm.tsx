/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import ApiError from '@/components/shared/ApiError';
import useLoggedInUser from '@/utils/getLoggedInUser';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SignupSchema from '@/validations/sign-up.schema';

type ITeamPermissions = {
    viewPrices?: boolean;
    createOrders?: boolean;
    exportInvoices?: boolean;
    viewAllServices?: boolean;
};

type TService = { name: string; price?: number };

export default function RootInviteTeamMemberForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useLoggedInUser();

    const ownerUserID = searchParams.get('ownerUserID') || '';
    const token = searchParams.get('token') || '';

    const rawPerms =
        searchParams.get('permissions') ?? searchParams.get('perms');
    const fullServicesFlag = searchParams.get('fullServices') === 'true';
    const rawServices = searchParams.get('services'); // "all" | JSON

    const parsedPermissions: ITeamPermissions = useMemo(() => {
        if (!rawPerms) return {};
        try {
            const p = JSON.parse(rawPerms);
            if (p && typeof p === 'object') return p as ITeamPermissions;
            return {};
        } catch {
            return {};
        }
    }, [rawPerms]);

    const parsedServices: 'all' | TService[] = useMemo(() => {
        if (fullServicesFlag) return 'all';
        if (!rawServices) return [];
        if (rawServices === 'all') return 'all';
        try {
            const v = JSON.parse(rawServices);
            return Array.isArray(v) ? (v as TService[]) : [];
        } catch {
            return [];
        }
    }, [rawServices, fullServicesFlag]);

    const accessList = useMemo(() => {
        const arr: string[] = [];
        if (parsedPermissions.viewPrices) arr.push('View pricing');
        if (parsedPermissions.createOrders) arr.push('Create orders');
        if (parsedPermissions.exportInvoices) arr.push('Export invoices');
        if (parsedPermissions.viewAllServices) arr.push('View all services');
        return arr;
    }, [parsedPermissions]);

    const serviceScopeText = useMemo(() => {
        if (
            parsedServices === 'all' ||
            parsedPermissions.viewAllServices ||
            fullServicesFlag
        ) {
            return 'All services';
        }
        if (!parsedServices.length) return 'None specified';
        return parsedServices
            .map((s) => (s.price != null ? `${s.name} — ${s.price}` : s.name))
            .join(', ');
    }, [parsedServices, parsedPermissions, fullServicesFlag]);

    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof SignupSchema>>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: '',
            username: '',
            email: '',
            phone: '',
            company: '',
            address: '',
            password: '',
            provider: 'credentials',
        },
    });

    useEffect(() => {
        if (!ownerUserID || !token) {
            toast.error('Invalid or incomplete invitation link.');
        }
    }, [ownerUserID, token]);

    const onSubmit = async (data: z.infer<typeof SignupSchema>) => {
        try {
            setIsLoading(true);

            if (user?.email) {
                toast.error(
                    `You are logged in as ${user.email}. Please log out and try again.`,
                    {
                        icon: (
                            <TriangleAlert className="w-6 h-6 text-amber-400" />
                        ),
                    }
                );
                return;
            }

            if (!ownerUserID || !token) {
                toast.error('Missing invitation parameters.');
                return;
            }

            const response = await fetch('/api/user/create-users-team-member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // account fields
                    ...data,
                    provider: 'credentials',
                    ownerUserID,
                    token,
                    permissions: parsedPermissions,
                    services: parsedServices === 'all' ? [] : parsedServices,
                }),
            });

            const resData = await response.json();

            if (!response.ok) {
                toast.error(resData?.message || 'Failed to accept invitation.');
                return;
            }

            toast.success('Account created! Please sign in.');
            form.reset();
            router.push('/sign-in');
        } catch (error) {
            ApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Sign-up form (same vibe as your RootInvitationForm) */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <fieldset disabled={isLoading} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your full name"
                                            type="text"
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
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Choose a username"
                                            type="text"
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
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="name@example.com"
                                            type="email"
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
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your phone number"
                                            type="tel"
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
                                    <FormLabel>Company</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your company"
                                            type="text"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your address"
                                            type="text"
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
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Create a password"
                                            type="password"
                                            required
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className={cn(
                                'w-full',
                                isLoading && 'cursor-not-allowed'
                            )}
                            disabled={isLoading}
                            aria-busy={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : null}
                            {isLoading ? 'Creating account…' : 'Create account'}
                        </Button>
                    </fieldset>
                </form>
            </Form>
        </div>
    );
}
