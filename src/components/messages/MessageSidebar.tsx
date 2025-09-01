'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Search, Inbox, RotateCcw, CircleX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetConversationsQuery } from '@/redux/features/conversation/conversationApi';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { IConversation } from '@/types/conversation.interface';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { useMemo, useState } from 'react';
import { Button } from '../ui/button';

export default function MessageSidebar() {
    const { user } = useLoggedInUser();
    const { userID } = user || {};
    const pathname = usePathname();
    const [search, setSearch] = useState<string>('');

    const { data, isLoading, isFetching, isError, refetch } =
        useGetConversationsQuery(userID, { skip: !userID });

    const conversations = useMemo(() => {
        const list = data?.conversations ?? [];
        if (!search.trim()) return list;
        const s = search.trim().toLowerCase();
        return list.filter((c: IConversation) => {
            const u = c.participants.find((p) => p.role === 'user');
            return (
                u?.name?.toLowerCase().includes(s) ||
                u?.email?.toLowerCase().includes(s) ||
                c.lastMessageText?.toLowerCase().includes(s)
            );
        });
    }, [data, search]);

    const renderLoading = () => (
        <ul className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="px-3 py-3">
                    <ConversationSkeleton />
                </li>
            ))}
        </ul>
    );

    const renderError = () => (
        <div className="p-6 text-center">
            <p className="text-sm text-destructive">
                Something went wrong. Please try again.
            </p>
            <Button onClick={() => refetch()}>
                <RotateCcw className="h-3.5 w-3.5" /> Retry
            </Button>
        </div>
    );

    const renderEmpty = () => (
        <div className="px-6 py-10 text-center text-gray-500">
            <div className="mx-auto mb-3 grid size-10 place-items-center rounded-lg bg-gray-100">
                <Inbox className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">
                {search ? 'No results for your search' : 'No conversations yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
                {search
                    ? 'Try a different name, email, or last message'
                    : 'New messages will appear here'}
            </p>
            {search && (
                <Button
                    onClick={() => setSearch('')}
                    className="mt-6"
                    variant={'secondary'}
                >
                    <CircleX />
                    Clear search
                </Button>
            )}
        </div>
    );

    const renderList = () => (
        <ul className="divide-y divide-gray-100">
            {conversations.map((c: IConversation) => {
                const u = c.participants.find((p) => p.role === 'user');
                const isActive = pathname?.startsWith(`/messages/${c._id}`);
                return (
                    <li key={c._id}>
                        <Link
                            href={`/messages/${c._id}`}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 transition',
                                'hover:bg-gray-50',
                                isActive && 'bg-orange-50'
                            )}
                        >
                            <div className="relative">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={u?.image} alt={u?.name} />
                                    <AvatarFallback>
                                        {u?.name
                                            ?.split(' ')
                                            .map((x) => x[0])
                                            .join('')}
                                    </AvatarFallback>
                                </Avatar>
                                {u?.isOnline ? (
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                                ) : (
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-gray-500" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-medium text-sm truncate">
                                        {u?.name}
                                    </p>
                                    <span className="text-[11px] text-gray-400 shrink-0">
                                        {c.lastMessageAt &&
                                            formatDistanceToNow(
                                                typeof c.lastMessageAt ===
                                                    'string'
                                                    ? new Date(c.lastMessageAt)
                                                    : c.lastMessageAt,
                                                { addSuffix: true }
                                            )}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                    {c.lastMessageText || 'No messages yet'}
                                </p>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );

    return (
        <aside className="flex flex-col h-full w-full max-w-xs shrink-0 border-r bg-white/80 backdrop-blur">
            <div className="p-4 flex items-center gap-2 border-b">
                <div className="size-9 rounded-xl bg-orange-500 grid place-items-center shadow">
                    <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold">Messages</h2>
                    <p className="text-xs text-gray-500">Support inbox</p>
                </div>
            </div>

            <div className="px-3 py-2">
                <div className="relative">
                    <Input
                        placeholder="Search conversations…"
                        className="w-full rounded-lg border px-9 py-2 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <div
                className="overflow-y-auto h-[calc(100vh-200px)]"
                aria-live="polite"
            >
                {isLoading
                    ? renderLoading()
                    : isError
                    ? renderError()
                    : (conversations?.length ?? 0) === 0
                    ? renderEmpty()
                    : renderList()}
                {isFetching && !isLoading && (
                    <p className="px-4 py-2 text-[11px] text-gray-400">
                        Updating…
                    </p>
                )}
            </div>
        </aside>
    );
}

function ConversationSkeleton() {
    return (
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[160px]" />
            </div>
        </div>
    );
}
