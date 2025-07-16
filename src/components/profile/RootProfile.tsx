'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
    Calendar,
    Mail,
    Phone,
    ShieldCheck,
    User2,
    Clock,
    UserCircle,
    CalendarDays,
    Settings,
    Verified,
    Edit,
    Save,
    X,
    Loader2,
    Camera,
    Key,
    Lock,
    Globe,
    MapPin,
    Building,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ISanitizedUser } from '@/types/user.interface';
import {
    useUpdateAvatarMutation,
    useUpdatePasswordMutation,
    useUpdateUserMutation,
} from '@/redux/features/users/userApi';
import toast from 'react-hot-toast';
import ApiError from '../shared/ApiError';

export default function ProfilePage() {
    const { user } = useLoggedInUser();
    const [updateUser, { isLoading: isUpdatingInfo }] = useUpdateUserMutation();
    const [updatePassword, { isLoading: isUpdatingPassword }] =
        useUpdatePasswordMutation();
    const [updateAvatar, { isLoading: isUpdatingAvatar }] =
        useUpdateAvatarMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<ISanitizedUser | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setEditedUser(user);
        }
    }, [user]);

    if (!user || !editedUser) {
        return (
            <section className="p-6 space-y-4">
                <Skeleton className="h-64 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-72 rounded-xl" />
                    <Skeleton className="h-72 rounded-xl" />
                </div>
                <Skeleton className="h-96 rounded-xl" />
            </section>
        );
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setEditedUser((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('image', file);

            const res = await updateAvatar({
                userID: user.userID,
                formData,
            }).unwrap();

            if (res.success) {
                toast.success('Avatar updated successfully');
            } else {
                toast.error(res.message || 'Failed to update avatar');
                setSelectedImage(null);
            }
        } catch (err) {
            ApiError(err);
            setSelectedImage(null);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSaveChanges = async () => {
        try {
            const response = await updateUser({
                userID: user.userID,
                data: editedUser,
            }).unwrap();

            if (response.success) {
                setIsEditing(false);
                toast.success('Profile updated successfully');
            } else {
                toast.error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const handleCancelEdit = () => {
        setEditedUser(user);
        setSelectedImage(null);
        setIsEditing(false);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const res = await updatePassword({
                userID: user.userID!,
                currentPassword,
                newPassword,
            }).unwrap();

            if (res.success) {
                toast.success('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(res.message || 'Failed to update password');
            }
        } catch (err) {
            ApiError(err);
        }
    };

    return (
        <section className="container space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20 shadow-sm">
                <CardContent className="relative pt-8 pb-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0 flex justify-center relative group">
                            <div className="relative">
                                <Avatar className="h-36 w-36 border-4 border-background ring-2 ring-primary/20 group-hover:ring-4 group-hover:ring-primary/30 transition-all duration-300 ease-in-out">
                                    <AvatarImage
                                        src={selectedImage || user.image || ''}
                                        alt={user.name}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                        {isUpdatingAvatar ? (
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        ) : (
                                            user.name?.charAt(0).toUpperCase()
                                        )}
                                    </AvatarFallback>
                                </Avatar>

                                {isEditing && (
                                    <>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            disabled={isUpdatingAvatar}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 bg-primary hover:bg-primary/90 shadow-md transition-all duration-200 hover:scale-105"
                                            onClick={triggerFileInput}
                                            disabled={isUpdatingAvatar}
                                        >
                                            {isUpdatingAvatar ? (
                                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                                            ) : (
                                                <Camera className="w-5 h-5 text-white" />
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex-grow text-center md:text-left space-y-4 pt-2 md:pt-0">
                            <div className="space-y-3">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <Input
                                            name="name"
                                            value={editedUser.name || ''}
                                            onChange={handleInputChange}
                                            className="text-3xl font-bold h-14 px-4 py-6"
                                            disabled={isUpdatingInfo}
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-lg">
                                                @
                                            </span>
                                            <Input
                                                name="username"
                                                value={
                                                    editedUser.username || ''
                                                }
                                                onChange={handleInputChange}
                                                className="h-10 text-base"
                                                disabled={isUpdatingInfo}
                                            />
                                            <Badge
                                                variant={
                                                    user.isEmailVerified
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                                className="gap-1"
                                            >
                                                {user.isEmailVerified ? (
                                                    <>
                                                        <Verified size={16} />
                                                        Verified
                                                    </>
                                                ) : (
                                                    'Unverified'
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight">
                                            {user.name}
                                        </h2>
                                        <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                                            <span className="text-muted-foreground text-lg">
                                                @{user.username}
                                            </span>
                                            <Badge
                                                variant={
                                                    user.isEmailVerified
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                                className="gap-1"
                                            >
                                                {user.isEmailVerified ? (
                                                    <>
                                                        <Verified size={16} />
                                                        Verified
                                                    </>
                                                ) : (
                                                    'Unverified'
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                <div className="flex flex-col items-center md:items-start gap-1 p-3 bg-background/50 rounded-lg border">
                                    <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4 text-primary" />
                                        Email
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            name="email"
                                            value={editedUser.email || ''}
                                            onChange={handleInputChange}
                                            className="h-8 text-sm"
                                            disabled={isUpdatingInfo}
                                        />
                                    ) : (
                                        <span className="text-sm font-medium">
                                            {user.email}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col items-center md:items-start gap-1 p-3 bg-background/50 rounded-lg border">
                                    <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4 text-primary" />
                                        Phone
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            name="phone"
                                            value={editedUser.phone || ''}
                                            onChange={handleInputChange}
                                            className="h-8 text-sm"
                                            placeholder="Add phone"
                                            disabled={isUpdatingInfo}
                                        />
                                    ) : (
                                        <span className="text-sm font-medium">
                                            {user.phone || 'Not set'}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col items-center md:items-start gap-1 p-3 bg-background/50 rounded-lg border">
                                    <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Globe className="w-4 h-4 text-primary" />
                                        Provider
                                    </Label>
                                    <span className="text-sm font-medium capitalize">
                                        {user.provider}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center md:items-start gap-1 p-3 bg-background/50 rounded-lg border">
                                    <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Joined
                                    </Label>
                                    <span className="text-sm font-medium">
                                        {user.createdAt &&
                                            format(
                                                new Date(user.createdAt),
                                                'MMM d, yyyy'
                                            )}
                                    </span>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="flex flex-col gap-1 p-3 bg-background/50 rounded-lg border">
                                        <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            Address
                                        </Label>
                                        <Textarea
                                            name="address"
                                            value={editedUser.address || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter your address"
                                            rows={2}
                                            className="text-sm"
                                            disabled={isUpdatingInfo}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1 p-3 bg-background/50 rounded-lg border">
                                        <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Building className="w-4 h-4 text-primary" />
                                            Company
                                        </Label>
                                        <Input
                                            name="company"
                                            value={editedUser.company || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter company name"
                                            className="text-sm"
                                            disabled={isUpdatingInfo}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute top-4 right-4">
                        {isEditing ? (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    disabled={
                                        isUpdatingInfo || isUpdatingAvatar
                                    }
                                    className="gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveChanges}
                                    disabled={
                                        isUpdatingInfo || isUpdatingAvatar
                                    }
                                    className="gap-1 shadow-md"
                                >
                                    {isUpdatingInfo ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {isUpdatingInfo
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                className="gap-1"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-primary/20 hover:border-primary/40 transition-colors duration-300">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserCircle className="w-5 h-5 text-primary" />
                                Account Details
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8"
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User2 className="w-4 h-4 text-muted-foreground" />
                                <span>Sign In Method</span>
                            </div>
                            <span className="font-medium text-sm capitalize">
                                {user.provider}
                            </span>
                        </div>

                        <div className="flex justify-between items-center border-b pb-3">
                            <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                                <span>Verification Status</span>
                            </div>
                            <Badge
                                variant={
                                    user.isEmailVerified
                                        ? 'default'
                                        : 'destructive'
                                }
                                className="gap-1"
                            >
                                {user.isEmailVerified ? (
                                    <>
                                        <Verified size={14} />
                                        Verified
                                    </>
                                ) : (
                                    'Unverified'
                                )}
                            </Badge>
                        </div>

                        <div className="flex justify-between items-center border-b pb-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>Last Login</span>
                            </div>
                            <span className="font-medium text-sm">
                                {user.lastLogin
                                    ? format(
                                          new Date(user.lastLogin),
                                          'MMM d, p'
                                      )
                                    : 'N/A'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm">
                                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                <span>Member Since</span>
                            </div>
                            <span className="font-medium text-sm">
                                {user.createdAt &&
                                    format(
                                        new Date(user.createdAt),
                                        'MMM yyyy'
                                    )}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card className="border-primary/20 hover:border-primary/40 transition-colors duration-300 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            Security Settings
                        </CardTitle>
                        <CardDescription>
                            Manage your password and account security
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Key className="w-4 h-4" />
                                Change Password
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="current-password"
                                        className="text-xs"
                                    >
                                        Current Password
                                    </Label>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-9"
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        disabled={isUpdatingPassword}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="new-password"
                                        className="text-xs"
                                    >
                                        New Password
                                    </Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-9"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        disabled={isUpdatingPassword}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="confirm-password"
                                        className="text-xs"
                                    >
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-9"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        disabled={isUpdatingPassword}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="ml-auto shadow-sm"
                            onClick={handleChangePassword}
                            disabled={
                                isUpdatingPassword ||
                                !currentPassword ||
                                !newPassword ||
                                !confirmPassword
                            }
                        >
                            {isUpdatingPassword ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            {isUpdatingPassword
                                ? 'Updating...'
                                : 'Save Security Settings'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </section>
    );
}
