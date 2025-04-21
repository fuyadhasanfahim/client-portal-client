'use client';

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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import SignupSchema from '@/validations/sign-up.schema';
import axiosInstance from '@/lib/axios-instance';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SignupForm() {
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: '',
            username: '',
            email: '',
            phone: '',
            company: '',
            country: '',
            password: '',
            provider: 'credentials',
        },
    });

    const onsubmit = async (data: z.infer<typeof SignupSchema>) => {
        try {
            const response = await axiosInstance.post(
                '/user/create-user',
                data
            );

            if (response.data.success) {
                toast.success('User created successfully! Please sign in.');

                form.reset();
                router.push('/sign-in');
            } else {
                toast.error(
                    response.data.message ||
                        'Something went wrong. Please try again.'
                );
            }
        } catch (error) {
            console.error('Error signing up:', error);
            toast.error('Something went wrong. Please try again.');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onsubmit)}>
                <div className="space-y-5">
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
                                        placeholder="Enter your full username"
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
                                        placeholder="Enter your email"
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
                        name="company"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company (Optional)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your company name"
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
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your country name"
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
                                        placeholder="Enter your password"
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
                        className="w-full col-span-2"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <Loader2 className="animate-spin" />
                        ) : null}
                        {form.formState.isSubmitting
                            ? 'Signing Up...'
                            : 'Sign Up'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
