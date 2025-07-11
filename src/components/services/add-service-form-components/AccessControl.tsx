import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IUser } from '@/types/user.interface';
import { addServiceSchema } from '@/validations/add-service.schema';
import { IconSearch, IconUsers } from '@tabler/icons-react';
import { X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

type AddServiceFormType = z.infer<typeof addServiceSchema>;

type AccessControlProps = {
    toggleUser: (userID: string) => void;
    form: UseFormReturn<AddServiceFormType>;
    setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
    accessibleTo: 'All' | 'Custom';
    selectedUsers: string[];
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    isUserLoading: boolean;
    data: { data: IUser[] };
    filteredUsers: IUser[];
};

export default function AccessControl({
    toggleUser,
    form,
    setSelectedUsers,
    accessibleTo,
    selectedUsers,
    searchQuery,
    setSearchQuery,
    isUserLoading,
    data,
    filteredUsers,
}: AccessControlProps) {
    return (
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
                                            setSelectedUsers([]);
                                        }
                                    }}
                                    defaultValue={field.value}
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
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 border rounded-lg">
                                {selectedUsers.map((userID) => {
                                    const user = data?.data.find(
                                        (u: IUser) => u.userID === userID
                                    );
                                    return (
                                        <Badge
                                            key={userID}
                                            variant="outline"
                                            className="border-primary text-primary bg-green-50"
                                        >
                                            <span className="truncate">
                                                {user?.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleUser(userID)
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
                                    ) : filteredUsers.length === 0 ? (
                                        <div className="text-center py-6">
                                            <p className="text-slate-500">
                                                No users found matching your
                                                search
                                            </p>
                                        </div>
                                    ) : (
                                        filteredUsers.map((user: IUser) => (
                                            <div
                                                key={user.userID}
                                                className={`p-3 hover:bg-green-50 transition-colors ${
                                                    selectedUsers.includes(
                                                        user.userID
                                                    )
                                                        ? 'bg-green-50'
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id={user.userID}
                                                        checked={selectedUsers.includes(
                                                            user.userID!
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleUser(
                                                                user.userID
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={user.userID}
                                                        className="flex flex-col items-start cursor-pointer w-full"
                                                    >
                                                        <span className="text-sm font-medium text-slate-800">
                                                            {user.name}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {user.email}
                                                        </span>
                                                    </Label>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
