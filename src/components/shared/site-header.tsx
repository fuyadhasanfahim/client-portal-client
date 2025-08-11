'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import React from 'react';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import ApiError from './ApiError';
import { Bell } from 'lucide-react';
import {
    useGetNotificationsQuery,
    useUpdateNotificationMutation,
} from '@/redux/features/notifications/notification';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface INotification {
    _id: string;
    userID: string;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: Date;
}

export function SiteHeader({
    user,
}: {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string;
    };
}) {
    const router = useRouter();

    const [open, setOpen] = useState(false);

    const { data, isLoading, refetch } = useGetNotificationsQuery(user.id, {
        skip: !user.id,
    });

    const [updateNotification] = useUpdateNotificationMutation();

    const notifications: INotification[] =
        (!isLoading && data.notifications) || [];

    useEffect(() => {
        if (!user?.id) return;

        socket.connect();

        socket.on('connect', () => {
            socket.emit('join-user-room', user.id);
        });

        socket.on('new-notification', () => {
            refetch();
        });

        return () => {
            socket.off('new-notification');
            socket.disconnect();
        };
    }, [user?.id, refetch]);

    const handleNotificationClick = async ({
        notificationID,
        link,
    }: {
        notificationID: string;
        link: string;
    }) => {
        try {
            await updateNotification(notificationID).unwrap();

            setOpen(false);
            if (link) router.push(link);
        } catch (error) {
            ApiError(error);
        }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <header className="flex h-16 shrink-0 px-4 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-4 h-5">
                    <SidebarTrigger />
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu open={open} onOpenChange={setOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={'outline'}
                                size={'icon'}
                                className="relative"
                            >
                                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors" />
                                {unreadCount > 0 && (
                                    <span
                                        className={cn(
                                            'absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white leading-none px-1 shadow-lg',
                                            unreadCount !== 0
                                                ? 'animate-pulse'
                                                : ''
                                        )}
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            sideOffset={8}
                            className="w-80 max-h-96 overflow-hidden rounded-xl"
                        >
                            <DropdownMenuLabel className="px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                        Notifications
                                    </span>
                                    {unreadCount > 0 && (
                                        <Badge variant={'destructive'}>
                                            {unreadCount} New
                                        </Badge>
                                    )}
                                </div>
                            </DropdownMenuLabel>

                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 px-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                            <Bell className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                            No notifications yet
                                        </p>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <DropdownMenuItem
                                            key={n._id}
                                            className="cursor-pointer p-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-150"
                                            onClick={() =>
                                                handleNotificationClick({
                                                    notificationID: n._id!,
                                                    link: n.link!,
                                                })
                                            }
                                        >
                                            <div className="flex items-start gap-3 w-full">
                                                {!n.read && (
                                                    <div className="w-2 h-2 animate-pulse bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`text-sm font-medium leading-tight mb-1 ${
                                                            n.read
                                                                ? 'text-slate-600 dark:text-slate-300'
                                                                : 'text-slate-900 dark:text-slate-100'
                                                        }`}
                                                    >
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-1">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                                        {formatDistanceToNow(
                                                            n.createdAt
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <NavUser user={user} />
                </div>
            </div>
        </header>
    );
}
