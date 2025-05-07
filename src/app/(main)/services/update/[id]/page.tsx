'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Button } from '@/components/ui/button';
import {
    IconDeviceFloppy,
    IconTrash,
    IconPlus,
    IconRestore,
    IconSearch,
    IconUsers,
    IconCurrencyDollar,
    IconPackage,
    IconTag,
} from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import ApiError from '@/components/shared/ApiError';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import {
    useGetSingleServiceQuery,
    useUpdateServiceMutation,
} from '@/redux/features/services/servicesApi';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateServiceSchema } from '@/validations/update-service.schema';
import { ArrowLeft, Save, TriangleAlert, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useGetUsersWithRoleQuery } from '@/redux/features/users/userApi';
import IUser from '@/types/user.interface';

export default function EditServicePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [hasComplexPricing, setHasComplexPricing] = useState(false);

    const form = useForm<z.infer<typeof updateServiceSchema>>({
        resolver: zodResolver(updateServiceSchema),
        defaultValues: {
            name: '',
            price: 0,
            complexities: [],
            accessibleTo: 'All',
            accessList: [],
            status: 'Active',
        },
    });

    const { data, isLoading } = useGetSingleServiceQuery(id || '');
    const { data: userData, isLoading: isUserLoading } =
        useGetUsersWithRoleQuery('User');

    useEffect(() => {
        if (data && !isLoading) {
            form.reset({
                name: data.data.name,
                status: data.data.status,
                price: data.data.price,
                complexities: data.data.complexities,
                accessibleTo: data.data.accessibleTo,
                accessList: data.data.accessList,
            });
            setSelectedUsers(data.data.accessList);
        }
    }, [data, isLoading, form]);

    const accessibleTo = form.watch('accessibleTo');

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'complexities',
    });

    useEffect(() => {
        setHasComplexPricing(fields.length > 0);

        if (selectedUsers.length > 0 && accessibleTo === 'Custom') {
            form.setValue('accessList', selectedUsers);
        }
    }, [fields.length, selectedUsers, accessibleTo, form]);

    const toggleUser = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const filteredUsers = isUserLoading
        ? []
        : userData.data.filter(
              (user: IUser) =>
                  user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchQuery.toLowerCase())
          );

    const [updateService, { isLoading: isUpdating }] =
        useUpdateServiceMutation();

    const onSubmit = async (data: z.infer<typeof updateServiceSchema>) => {
        try {
            if (hasComplexPricing) {
                data.price = 0;
            } else {
                data.complexities = [];
            }

            if (data.accessibleTo === 'Custom') {
                data.accessList = selectedUsers;
            } else {
                data.accessList = [];
            }

            const response = await updateService({ ...data, id }).unwrap();

            if (response.success) {
                toast.success(response.message);
                form.reset({
                    name: data.name,
                    complexities: data.complexities,
                    status: data.status,
                });

                router.push('/services');
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Update service Form</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IconPackage size={20} />
                                    <span>Service Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel>
                                                    Service Name
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. Clipping Path"
                                                        required
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel>
                                                        Base Price
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-2.5 text-slate-500">
                                                                <IconCurrencyDollar
                                                                    size={18}
                                                                />
                                                            </span>
                                                            <Input
                                                                type="number"
                                                                value={
                                                                    field.value ||
                                                                    ''
                                                                }
                                                                placeholder="e.g. 49.99"
                                                                step="0.01"
                                                                min="0"
                                                                disabled={
                                                                    hasComplexPricing
                                                                }
                                                                className="pl-10"
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    {hasComplexPricing && (
                                                        <FormDescription className="text-amber-600 text-xs flex items-center gap-1">
                                                            <TriangleAlert
                                                                size={16}
                                                            />
                                                            <span>
                                                                Fixed price is
                                                                disabled when
                                                                using complex
                                                                pricing
                                                            </span>
                                                        </FormDescription>
                                                    )}
                                                    <FormMessage className="text-destructive" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={hasComplexPricing}
                                                    onCheckedChange={(
                                                        checked
                                                    ) => {
                                                        setHasComplexPricing(
                                                            checked
                                                        );
                                                        if (!checked) {
                                                            form.setValue(
                                                                'complexities',
                                                                []
                                                            );
                                                        }
                                                    }}
                                                    id="complex-pricing"
                                                />
                                                <Label htmlFor="complex-pricing">
                                                    Enable Tiered Pricing
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IconUsers size={20} />
                                    <span>Access Control</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="accessibleTo"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel>Accessible To</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        if (value === 'All') {
                                                            setSelectedUsers(
                                                                []
                                                            );
                                                        }
                                                    }}
                                                    value={field.value}
                                                    className="flex gap-6"
                                                >
                                                    <FormItem className="flex items-center space-x-3">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value="All"
                                                                className="hover:border-primary transition-colors duration-200"
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">
                                                            All Users
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value="Custom"
                                                                className="hover:border-primary transition-colors duration-200"
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">
                                                            Custom Access
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />

                                {accessibleTo === 'Custom' && (
                                    <div className="mt-6 space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <IconSearch
                                                    className="text-slate-400"
                                                    size={18}
                                                />
                                            </div>
                                            <Input
                                                type="search"
                                                placeholder="Search users by name or email..."
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value
                                                    )
                                                }
                                                className="pl-10"
                                            />
                                        </div>

                                        {selectedUsers.length > 0 && (
                                            <div className="flex flex-wrap gap-2 p-3 border rounded-lg">
                                                {selectedUsers.map((userId) => {
                                                    const user =
                                                        userData?.data.find(
                                                            (u: IUser) =>
                                                                u._id === userId
                                                        );
                                                    return (
                                                        <Badge
                                                            key={userId}
                                                            variant="outline"
                                                            className="border-primary text-primary bg-green-50"
                                                        >
                                                            <span className="truncate">
                                                                {user?.name}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleUser(
                                                                        userId
                                                                    )
                                                                }
                                                                className="rounded-full p-0.5 group cursor-pointer"
                                                            >
                                                                <X className="size-3 text-primary group-hover:text-destructive" />
                                                            </button>
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div className="border rounded-lg overflow-hidden">
                                            <ScrollArea className="max-h-64 w-full">
                                                <div className="divide-y">
                                                    {isUserLoading ? (
                                                        <div className="text-center py-6">
                                                            <p className="text-slate-500">
                                                                Loading...
                                                            </p>
                                                        </div>
                                                    ) : filteredUsers.length ===
                                                      0 ? (
                                                        <div className="text-center py-6">
                                                            <p className="text-slate-500">
                                                                No users found
                                                                matching your
                                                                search
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        filteredUsers.map(
                                                            (user: IUser) => (
                                                                <div
                                                                    key={
                                                                        user._id
                                                                    }
                                                                    className={`p-3 hover:bg-green-50 transition-colors ${
                                                                        selectedUsers.includes(
                                                                            user._id!
                                                                        )
                                                                            ? 'bg-green-50'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <Checkbox
                                                                            id={
                                                                                user._id!
                                                                            }
                                                                            checked={selectedUsers.includes(
                                                                                user._id!
                                                                            )}
                                                                            onCheckedChange={() =>
                                                                                toggleUser(
                                                                                    user._id!
                                                                                )
                                                                            }
                                                                        />
                                                                        <Label
                                                                            htmlFor={
                                                                                user._id!
                                                                            }
                                                                            className="flex flex-col items-start cursor-pointer w-full"
                                                                        >
                                                                            <span className="text-sm font-medium text-slate-800">
                                                                                {
                                                                                    user.name
                                                                                }
                                                                            </span>
                                                                            <span className="text-xs text-slate-500">
                                                                                {
                                                                                    user.email
                                                                                }
                                                                            </span>
                                                                        </Label>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {hasComplexPricing && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <IconTag size={20} />
                                        <span>Pricing Tiers</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {fields.length === 0 ? (
                                            <div className="text-center py-8 bg-green-50 border-2 border-dashed rounded-lg">
                                                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                                    <IconPlus className="text-primary" />
                                                </div>
                                                <h3 className="text-lg font-medium text-slate-800 mb-1">
                                                    No pricing tiers yet
                                                </h3>
                                                <p className="text-slate-500 mb-4 max-w-md mx-auto">
                                                    Add different pricing tiers
                                                    for different service levels
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        append({
                                                            label: '',
                                                            price: 0,
                                                        })
                                                    }
                                                    className="border-primary bg-white text-primary"
                                                >
                                                    <IconPlus size={16} />
                                                    Add First Tier
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-4">
                                                    {fields.map(
                                                        (item, index) => (
                                                            <div
                                                                key={item.id}
                                                                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border border-slate-200 rounded-lg bg-white shadow-xs"
                                                            >
                                                                <FormField
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name={`complexities.${index}.label`}
                                                                    render={({
                                                                        field,
                                                                    }) => (
                                                                        <FormItem className="md:col-span-5 space-y-2">
                                                                            <FormLabel>
                                                                                Tier
                                                                                Name{' '}
                                                                                <span className="text-red-500">
                                                                                    *
                                                                                </span>
                                                                            </FormLabel>
                                                                            <FormControl>
                                                                                <Input
                                                                                    placeholder="e.g. Basic, Pro, Enterprise"
                                                                                    {...field}
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage className="text-red-500 text-xs" />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                <FormField
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name={`complexities.${index}.price`}
                                                                    render={({
                                                                        field,
                                                                    }) => (
                                                                        <FormItem className="md:col-span-5 space-y-2">
                                                                            <FormLabel className="text-slate-700">
                                                                                Price{' '}
                                                                                <span className="text-red-500">
                                                                                    *
                                                                                </span>
                                                                            </FormLabel>
                                                                            <FormControl>
                                                                                <div className="relative">
                                                                                    <span className="absolute left-3 top-2.5 text-slate-500">
                                                                                        <IconCurrencyDollar
                                                                                            size={
                                                                                                18
                                                                                            }
                                                                                        />
                                                                                    </span>
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={
                                                                                            field.value ||
                                                                                            ''
                                                                                        }
                                                                                        placeholder="e.g. 99.99"
                                                                                        step="0.01"
                                                                                        min="0"
                                                                                        className="pl-10"
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            field.onChange(
                                                                                                Number(
                                                                                                    e
                                                                                                        .target
                                                                                                        .value
                                                                                                )
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            </FormControl>
                                                                            <FormMessage className="text-red-500 text-xs" />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                <div className="md:col-span-2 flex justify-end">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            remove(
                                                                                index
                                                                            )
                                                                        }
                                                                        className="border-destructive text-destructive bg-red-50"
                                                                    >
                                                                        <IconTrash
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        append({
                                                            label: '',
                                                            price: 0,
                                                        })
                                                    }
                                                    className="border-primary bg-white text-primary"
                                                >
                                                    <IconPlus
                                                        size={16}
                                                        className="mr-1"
                                                    />
                                                    Add Another Tier
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <Button
                                type="reset"
                                variant="outline"
                                onClick={() => {
                                    router.push('/services');
                                }}
                                disabled={isUpdating}
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            >
                                <ArrowLeft size={18} />
                                Back
                            </Button>
                            <Button
                                type="reset"
                                variant="outline"
                                onClick={() => {
                                    form.reset();
                                    setSelectedUsers([]);
                                    setHasComplexPricing(false);
                                }}
                                disabled={isUpdating}
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            >
                                <IconRestore size={18} />
                                Reset
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? (
                                    <span className="flex items-center">
                                        <Save />
                                        Saving...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <IconDeviceFloppy size={18} />
                                        Save Service
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
