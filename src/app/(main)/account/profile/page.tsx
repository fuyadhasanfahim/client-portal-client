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
    Settings,
    Bell,
    VerifiedIcon,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
    title: 'Profile - Account | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default async function ProfilePage() {
    const user = await getUserData();

    if (!user) {
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

    const hasActiveAlerts = !user.isEmailVerified || user.isBlocked;

    return (
        <section className="container py-6 space-y-6">
            {hasActiveAlerts && (
                <div className="space-y-3">
                    {!user.isEmailVerified && (
                        <Alert variant="destructive">
                            <AlertDescription className="flex items-center justify-between">
                                <span>
                                    Your email address is not verified. Please
                                    verify your email to access all features.
                                </span>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            Verify Email
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Verify Your Email Address
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Check your inbox for a
                                                verification link to verify your
                                                email address. If you
                                                didn&apos;t receive the email,
                                                click the button below to resend
                                                it.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction>
                                                Resend
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </AlertDescription>
                        </Alert>
                    )}

                    {user.isBlocked && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                Your account has been blocked. Please contact
                                support for assistance.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}

            <Card className="bg-accent">
                <CardContent className="relative">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 flex justify-center">
                            <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary/20">
                                <AvatarImage
                                    src={user.profileImage || ''}
                                    alt={user.name}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                    {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex-grow text-center md:text-left space-y-2 pt-6 md:pt-0">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold">
                                        {user.name}
                                    </h2>
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        @{user.username}{' '}
                                        {user.isEmailVerified ? (
                                            <VerifiedIcon
                                                size={18}
                                                className="text-blue-500"
                                            />
                                        ) : (
                                            <VerifiedIcon
                                                size={18}
                                                className="text-red-500"
                                            />
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-3 md:mt-0 justify-center md:justify-start">
                                    <Badge
                                        variant="outline"
                                        className="bg-primary/10 text-primary border-primary/20"
                                    >
                                        {user.role}
                                    </Badge>
                                    <Badge
                                        variant={
                                            user.isActive
                                                ? 'outline'
                                                : 'secondary'
                                        }
                                        className={
                                            user.isActive
                                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                                : ''
                                        }
                                    >
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <span>{user.phone || 'Not Provided'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
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

            <Tabs
                defaultValue="overview"
                className="w-full relative overflow-hidden"
            >
                <TabsList className="grid w-full grid-cols-4 md:w-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <UserCircle className="w-5 h-5 text-primary" />
                                        Account Information
                                    </CardTitle>
                                    <Button variant="ghost" size="icon">
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-2">
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
                                        <Badge
                                            variant="outline"
                                            className="bg-green-500/10 text-green-600 border-green-500/20"
                                        >
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="bg-amber-500/10 text-amber-600 border-amber-500/20"
                                        >
                                            Not Verified
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex justify-between items-center border-b pb-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span>Last Login</span>
                                    </div>
                                    <span className="font-medium">
                                        {user.lastLogin
                                            ? format(
                                                  new Date(user.lastLogin),
                                                  'PPP p'
                                              )
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
                                            ? format(
                                                  new Date(user.createdAt),
                                                  'PPP'
                                              )
                                            : 'N/A'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary" />
                                        Account Status
                                    </CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-2">
                                <div className="flex justify-between items-center border-b pb-3">
                                    <span>Active Status</span>
                                    <Badge
                                        variant={
                                            user.isActive
                                                ? 'outline'
                                                : 'destructive'
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
                                            user.isBlocked
                                                ? 'destructive'
                                                : 'outline'
                                        }
                                        className={cn(
                                            'bg-transparent',
                                            !user.isBlocked &&
                                                'text-green-600 border-green-500'
                                        )}
                                    >
                                        {user.isBlocked
                                            ? 'Blocked'
                                            : 'Not Blocked'}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span>Deletion Status</span>
                                    <Badge
                                        variant={
                                            user.isDeleted
                                                ? 'destructive'
                                                : 'outline'
                                        }
                                        className={cn(
                                            'bg-transparent',
                                            !user.isDeleted &&
                                                'text-green-600 border-green-500'
                                        )}
                                    >
                                        {user.isDeleted ? 'Deleted' : 'Active'}
                                    </Badge>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    Manage Account
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-primary" />
                                        Notifications
                                    </CardTitle>
                                    <Button variant="ghost" size="icon">
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-2">
                                <div className="flex justify-between items-center border-b pb-3">
                                    <span>Email Notifications</span>
                                    <Badge
                                        variant="outline"
                                        className="bg-green-500/10 text-green-600 border-green-500/20"
                                    >
                                        Enabled
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center border-b pb-3">
                                    <span>Push Notifications</span>
                                    <Badge
                                        variant="outline"
                                        className="bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    >
                                        Disabled
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span>SMS Notifications</span>
                                    <Badge
                                        variant="outline"
                                        className="bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    >
                                        Disabled
                                    </Badge>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    Update Preferences
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your recent account activity and events
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                                            <div className="text-sm">
                                                {i === 0
                                                    ? 'Logged in from new device'
                                                    : i === 1
                                                    ? 'Updated profile information'
                                                    : 'Changed password'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(
                                                    new Date(
                                                        new Date().setDate(
                                                            new Date().getDate() -
                                                                i
                                                        )
                                                    ),
                                                    'PPP p'
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>
                                View and manage your past orders
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                Lorem ipsum dolor sit amet, consectetur
                                adipisicing elit. Inventore quibusdam
                                perferendis quam, nisi debitis placeat iure
                                molestias, culpa doloribus ipsam ut eos
                                temporibus obcaecati. Laboriosam tempore animi
                                repellendus dolores a!
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {!user.isEmailVerified && (
                    <div className="w-full h-full backdrop-blur z-10 absolute rounded-xl">
                        <div className="flex items-center justify-center w-full h-full">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-shadow-muted-foreground">
                                Verify to see the content
                            </h2>
                        </div>
                    </div>
                )}
            </Tabs>
        </section>
    );
}
