import { getUserData } from '@/actions/user.action';
import { Metadata } from 'next';
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
    Shield,
    UserCircle,
    CalendarDays,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Profile - Account | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default async function ProfilePage() {
    const user = await getUserData();

    if (!user) {
        return (
            <section className="p-6">
                <Skeleton className="h-64 w-full rounded-xl" />
            </section>
        );
    }

    return (
        <section className="container p-4">
            <Card className="rounded-xl bg-accent">
                <CardContent className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="flex-shrink-0">
                        <Avatar className="h-40 w-40 rounded-full">
                            <AvatarImage
                                src={user.profileImage || ''}
                                alt={user.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-5xl text-white rounded-xl">
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-grow text-center md:text-left">
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-bold">
                                {user.name}
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                @{user.username}
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
                                <Badge>{user.role}</Badge>
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground justify-center md:justify-start">
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{user.phone || 'Not Provided'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        Joined:{' '}
                                        {user.createdAt
                                            ? format(
                                                  new Date(user.createdAt),
                                                  'PPP'
                                              )
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-xl border border-border p-6">
                    <CardHeader className="flex items-center gap-2 mb-4">
                        <UserCircle className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold">
                            Account Information
                        </h2>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <div className="flex items-center gap-2">
                                <User2 className="w-4 h-4 text-muted-foreground" />
                                <span>Sign In Method</span>
                            </div>
                            <span className="font-medium capitalize">
                                {user.provider}
                            </span>
                        </div>

                        <div className="flex justify-between items-center border-b pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                                <span>Email Verification</span>
                            </div>
                            {user.isEmailVerified ? (
                                <span className="text-green-600 font-medium">
                                    Verified
                                </span>
                            ) : (
                                <span className="text-amber-600 font-medium">
                                    Not Verified
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between items-center border-b pb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>Last Login</span>
                            </div>
                            <span className="font-medium">
                                {user.lastLogin
                                    ? format(new Date(user.lastLogin), 'PPP p')
                                    : 'N/A'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                <span>Account Created</span>
                            </div>
                            <span className="font-medium">
                                {user.createdAt
                                    ? format(new Date(user.createdAt), 'PPP')
                                    : 'N/A'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border p-6">
                    <CardHeader className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold">
                            Account Status
                        </h2>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <span>Active Status</span>
                            <Badge
                                variant={
                                    user.isActive ? 'outline' : 'destructive'
                                }
                                className={cn(
                                    'bg-transparent',
                                    user.isActive
                                        ? 'text-green-600 border-green-500'
                                        : 'text-red-600 border-red-500'
                                )}
                            >
                                {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>

                        <div className="flex justify-between items-center border-b pb-3">
                            <span>Block Status</span>
                            <Badge
                                variant={
                                    user.isBlocked ? 'destructive' : 'outline'
                                }
                                className="bg-transparent"
                            >
                                {user.isBlocked ? 'Blocked' : 'Not Blocked'}
                            </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                            <span>Deletion Status</span>
                            <Badge
                                variant={
                                    user.isDeleted ? 'destructive' : 'outline'
                                }
                                className="bg-transparent"
                            >
                                {user.isDeleted ? 'Deleted' : 'Active'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
