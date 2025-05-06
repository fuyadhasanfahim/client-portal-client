'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
    IconDeviceFloppy,
    IconTrash,
    IconPlus,
    IconRestore,
    IconSearch,
    IconCurrencyDollar,
    IconPackage,
    IconUsers,
    IconTag,
    IconListCheck,
} from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { addServiceSchema } from '@/validations/add-service.schema';
import ApiError from '../shared/ApiError';
import { toast } from 'sonner';
import { useRef, useState, useEffect } from 'react';
import { DialogClose } from '../ui/dialog';
import { useAddServiceMutation } from '@/redux/features/services/servicesApi';
import { z } from 'zod';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';

const dummyUsers = Array.from({ length: 50 }).map((_, i) => ({
    id: `user-${i}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
}));

export default function AddServiceForm() {
    const closeRef = useRef<HTMLButtonElement | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [hasComplexPricing, setHasComplexPricing] = useState(false);

    const form = useForm<z.infer<typeof addServiceSchema>>({
        resolver: zodResolver(addServiceSchema),
        defaultValues: {
            name: '',
            price: 0,
            complexities: [],
            accessibleTo: 'All',
            accessList: [],
            status: 'Active',
        },
    });

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

    const [addService, { isLoading }] = useAddServiceMutation();

    const onSubmit = async (data: z.infer<typeof addServiceSchema>) => {
        try {
            if (hasComplexPricing) {
                data.price = 0;
            }

            if (data.accessibleTo === 'Custom') {
                data.accessList = selectedUsers;
            } else {
                data.accessList = [];
            }

            const response = await addService(data).unwrap();

            if (response.success) {
                toast.success(response.message);
                form.reset();
                setSelectedUsers([]);
                setHasComplexPricing(false);
                closeRef.current?.click();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const toggleUser = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const filteredUsers = dummyUsers.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <DialogClose asChild>
                <Button ref={closeRef} className="hidden" />
            </DialogClose>

            <Form {...form}>
                <form
                    className="space-y-8 px-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconPackage size={20} />
                                Service Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700">
                                                Service Name *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter the service name"
                                                    required
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">
                                                    Price
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
                                                            placeholder="e.g. 0.46"
                                                            step="0.01"
                                                            min="0"
                                                            disabled={
                                                                hasComplexPricing
                                                            }
                                                            className="pl-10"
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </FormControl>
                                                {hasComplexPricing && (
                                                    <FormDescription className="text-amber-600 text-xs">
                                                        Fixed price is disabled
                                                        when using complex
                                                        pricing
                                                    </FormDescription>
                                                )}
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={hasComplexPricing}
                                                onCheckedChange={(
                                                    checked:
                                                        | boolean
                                                        | ((
                                                              prevState: boolean
                                                          ) => boolean)
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
                                            <label
                                                htmlFor="complex-pricing"
                                                className="text-sm font-medium text-slate-700 cursor-pointer"
                                            >
                                                Enable Complex Pricing
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IconUsers size={20} />
                                    Access Control
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <FormField
                                    control={form.control}
                                    name="accessibleTo"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel>
                                                Accessible To
                                            </FormLabel>
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
                                                    defaultValue={field.value}
                                                    className="flex space-y-x"
                                                >
                                                    <FormItem className="flex items-center space-x-3">
                                                        <FormControl>
                                                            <RadioGroupItem value="All" />
                                                        </FormControl>
                                                        <FormLabel>
                                                            All Users
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3">
                                                        <FormControl>
                                                            <RadioGroupItem value="Custom" />
                                                        </FormControl>
                                                        <FormLabel>
                                                            Custom
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />

                                {accessibleTo === 'Custom' && (
                                    <div className="mt-4">
                                        <div className="relative mb-2">
                                            <Input
                                                type="search"
                                                placeholder="Search users..."
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value
                                                    )
                                                }
                                                className="pl-9 border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                            />
                                            <IconSearch
                                                className="absolute left-3 top-2.5 text-slate-500"
                                                size={18}
                                            />
                                        </div>

                                        {selectedUsers.length > 0 && (
                                            <div className="flex flex-wrap gap-2 my-2 p-2 border border-slate-200 rounded-md bg-slate-50">
                                                {selectedUsers.map((userId) => {
                                                    const user =
                                                        dummyUsers.find(
                                                            (u) =>
                                                                u.id === userId
                                                        );
                                                    return (
                                                        <Badge
                                                            key={userId}
                                                            variant="secondary"
                                                            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                        >
                                                            {user?.name}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-auto p-0 ml-1 text-blue-800 hover:text-blue-900"
                                                                onClick={() =>
                                                                    toggleUser(
                                                                        userId
                                                                    )
                                                                }
                                                            >
                                                                ×
                                                            </Button>
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <ScrollArea className="h-64 w-full rounded-md border border-slate-200 mt-2">
                                            <div className="p-2 space-y-1">
                                                {filteredUsers.length === 0 ? (
                                                    <p className="text-center text-slate-500 py-4">
                                                        No users found
                                                    </p>
                                                ) : (
                                                    filteredUsers.map(
                                                        (user) => (
                                                            <div
                                                                key={user.id}
                                                                className="p-2 hover:bg-slate-50 rounded-md"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={
                                                                            user.id
                                                                        }
                                                                        checked={selectedUsers.includes(
                                                                            user.id
                                                                        )}
                                                                        onCheckedChange={() =>
                                                                            toggleUser(
                                                                                user.id
                                                                            )
                                                                        }
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <label
                                                                            htmlFor={
                                                                                user.id
                                                                            }
                                                                            className="text-sm font-medium cursor-pointer"
                                                                        >
                                                                            {
                                                                                user.name
                                                                            }
                                                                        </label>
                                                                        <span className="text-xs text-slate-500">
                                                                            {
                                                                                user.email
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50 rounded-t-lg">
                                <CardTitle className="flex items-center text-slate-800">
                                    <IconListCheck className="mr-2" size={20} />
                                    Status & Additional Options
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-slate-700">
                                                Service Status
                                            </FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                    className="flex space-x-4"
                                                >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="Active" />
                                                        </FormControl>
                                                        <FormLabel className="font-medium text-slate-700">
                                                            Active
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="Inactive" />
                                                        </FormControl>
                                                        <FormLabel className="font-medium text-slate-700">
                                                            Inactive
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {hasComplexPricing && (
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50 rounded-t-lg">
                                <CardTitle className="flex items-center text-slate-800">
                                    <IconTag className="mr-2" size={20} />
                                    Pricing Tiers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    {fields.length === 0 ? (
                                        <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                                            <p className="text-slate-600 mb-2">
                                                No pricing tiers added yet
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
                                                className="bg-white hover:bg-slate-50"
                                            >
                                                <IconPlus
                                                    size={16}
                                                    className="mr-1"
                                                />
                                                Add your first tier
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            {fields.map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border border-slate-200 rounded-lg"
                                                >
                                                    <FormField
                                                        control={form.control}
                                                        name={`complexities.${index}.label`}
                                                        render={({ field }) => (
                                                            <FormItem className="md:col-span-5">
                                                                <FormLabel>
                                                                    Tier Name *
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="e.g. Basic, Standard, Premium"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-red-500" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`complexities.${index}.price`}
                                                        render={({ field }) => (
                                                            <FormItem className="md:col-span-5">
                                                                <FormLabel className="text-slate-700">
                                                                    Price *
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
                                                                            placeholder="e.g. 0.46"
                                                                            step="0.01"
                                                                            min="0"
                                                                            className="pl-9 border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
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
                                                                <FormMessage className="text-red-500" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="md:col-span-2 flex justify-end">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                remove(index)
                                                            }
                                                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200"
                                                        >
                                                            <IconTrash
                                                                size={16}
                                                                className="mr-1"
                                                            />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    append({
                                                        label: '',
                                                        price: 0,
                                                    })
                                                }
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

                    <div className="flex items-center justify-end gap-4 w-full pt-2">
                        <Button
                            type="reset"
                            variant="outline"
                            onClick={() => {
                                form.reset();
                                setSelectedUsers([]);
                                setHasComplexPricing(false);
                            }}
                            disabled={isLoading}
                            className="bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                        >
                            <IconRestore size={18} className="mr-1" />
                            Reset
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            <IconDeviceFloppy size={18} className="mr-1" />
                            Save Service
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
