'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Form } from '../ui/form';
import { Button } from '../ui/button';
import { IconDeviceFloppy, IconRestore } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { addServiceSchema } from '@/validations/add-service.schema';
import ApiError from '../shared/ApiError';
import toast from 'react-hot-toast';
import { useRef, useState, useEffect } from 'react';
import { DialogClose } from '../ui/dialog';
import { useAddServiceMutation } from '@/redux/features/services/servicesApi';
import { z } from 'zod';
import { Save } from 'lucide-react';
import { useGetUsersWithRoleQuery } from '@/redux/features/users/userApi';
import IUser from '@/types/user.interface';
import ServiceInformation from './add-service-form-components/ServiceInformation';
import ServiceTypes from './add-service-form-components/ServiceTypes';
import AccessControl from './add-service-form-components/AccessControl';
import PricingTiers from './add-service-form-components/PricingTiers';

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

    const {
        fields: typeFields,
        append: appendType,
        remove: removeType,
    } = useFieldArray({
        control: form.control,
        name: 'types',
    });

    useEffect(() => {
        if (selectedUsers.length > 0 && accessibleTo === 'Custom') {
            form.setValue('accessList', selectedUsers);
        }
    }, [fields.length, selectedUsers, accessibleTo, form]);

    const [addService, { isLoading }] = useAddServiceMutation();
    const { data, isLoading: isUserLoading } = useGetUsersWithRoleQuery('User');

    const toggleUser = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const filteredUsers = isUserLoading
        ? []
        : data.data.filter(
              (user: IUser) =>
                  user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchQuery.toLowerCase())
          );

    const onSubmit = async (data: z.infer<typeof addServiceSchema>) => {
        const hasPrice = typeof data.price === 'number' && data.price > 0;
        const hasComplexities = (data.complexities ?? []).length > 0;

        if (hasPrice && hasComplexities) {
            form.setError('price', {
                message: 'Cannot use both base price and complexity tiers.',
            });
            return;
        }

        if (!hasPrice && !hasComplexities) {
            form.setError('price', {
                message:
                    'Either base price or complexity tiers must be provided.',
            });
            return;
        }

        if (data.accessibleTo === 'Custom' && selectedUsers.length === 0) {
            form.setError('accessList', {
                message:
                    'Access list is required when Accessible To is Custom.',
            });
            return;
        }

        try {
            if (hasComplexPricing) {
                data.price = 0;
            } else {
                data.complexities = [];
            }

            data.accessList =
                data.accessibleTo === 'Custom' ? selectedUsers : [];

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

    return (
        <section className="px-4 pb-4">
            <DialogClose asChild>
                <Button ref={closeRef} className="hidden" />
            </DialogClose>

            <Form {...form}>
                <form
                    className="space-y-6"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <ServiceInformation
                        form={form}
                        hasComplexPricing={hasComplexPricing}
                        setHasComplexPricing={setHasComplexPricing}
                    />

                    <ServiceTypes
                        appendType={appendType}
                        removeType={removeType}
                        typeFields={typeFields}
                        form={form}
                    />

                    <AccessControl
                        form={form}
                        accessibleTo={accessibleTo}
                        data={data}
                        filteredUsers={filteredUsers}
                        isUserLoading={isUserLoading}
                        searchQuery={searchQuery}
                        selectedUsers={selectedUsers}
                        setSearchQuery={setSearchQuery}
                        setSelectedUsers={setSelectedUsers}
                        toggleUser={toggleUser}
                    />

                    <PricingTiers
                        form={form}
                        remove={remove}
                        append={append}
                        fields={fields}
                        hasComplexPricing={hasComplexPricing}
                    />

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button
                            type="reset"
                            variant="outline"
                            onClick={() => {
                                form.reset();
                                setSelectedUsers([]);
                                setHasComplexPricing(false);
                            }}
                            disabled={isLoading}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                            <IconRestore size={18} />
                            Reset
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Save />
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <IconDeviceFloppy size={18} />
                                    Save Service
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </section>
    );
}
