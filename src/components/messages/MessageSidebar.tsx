'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import {
    useGetConversationsQuery,
    useLazyGetConversationsQuery,
    type Conversation,
} from '@/redux/features/conversation/conversationApi';
import { useConversationSocket } from '@/utils/useConversationSocket';
import useLoggedInUser from '@/utils/getLoggedInUser';


export default function MessageSidebar() {
    const { user } = useLoggedInUser();

    const pathname = usePathname();

    const [cursor, setCursor] = useState<string | null>(null);
    const { data, isFetching, refetch } = useGetConversationsQuery({
        userID: user.userID,
        limit: 20,
        cursor,
    });

    const [fetchMore, { isFetching: loadingMore }] =
        useLazyGetConversationsQuery();
    const [older, setOlder] = useState<Conversation[]>([]);
    const conversations = useMemo<Conversation[]>(
        () => [...(data?.items ?? []), ...older],
        [data?.items, older]
    );

    useConversationSocket(process.env.NEXT_PUBLIC_BASE_URL!, user.userID);

    const loadMore = async () => {
        if (!data?.hasMore || loadingMore) return;
        const res = await fetchMore({
            userID: user.userID,
            limit: 20,
            cursor: data.nextCursor ?? null,
        }).unwrap();
        setOlder((prev) => [...prev, ...(res.items ?? [])]);
        setCursor(res.nextCursor ?? null);
    };

    return (
        <aside className="flex flex-col h-full w-full max-w-xs shrink-0 border-r bg-white/80 backdrop-blur">
            <div className="p-4 flex items-center gap-2 border-b">
                <div className="size-9 rounded-xl bg-orange-500 grid place-items-center shadow">
                    <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold">Messages</h2>
                    <p className="text-xs text-gray-500">
                        Chats with Admin & team
                    </p>
                </div>
            </div>

            <div className="px-3 py-2">
                <div className="relative">
                    <input
                        placeholder="Search conversations…"
                        className="w-full rounded-lg border px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <ul className="overflow-y-auto h-[calc(100vh-240px)]">
                {conversations.map((c) => {
                    const other =
                        c.participants.find(
                            (p) => p.userID !== user.userID
                        ) ?? c.participants[0];
                    const href = `/messages/${c._id}`;
                    const active = pathname?.startsWith(href);
                    return (
                        <li key={c._id}>
                            <Link
                                href={href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition',
                                    active && 'bg-teal-50/70'
                                )}
                            >
                                <Avatar name={other?.name ?? 'User'} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-sm truncate">
                                            {other?.name ?? 'User'}
                                        </p>
                                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                            {c.lastMessageAt
                                                ? formatDistanceToNow(
                                                      new Date(c.lastMessageAt),
                                                      {
                                                          addSuffix: true,
                                                      }
                                                  )
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs text-gray-500 truncate">
                                            {other?.email ?? ''}
                                        </p>
                                        {!!c.unread && (
                                            <span className="text-[10px] bg-teal-500 text-white px-1.5 py-0.5 rounded-full">
                                                {c.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="p-3 border-t flex gap-2">
                <button
                    onClick={() => refetch()}
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    disabled={isFetching}
                >
                    Refresh
                </button>
                <button
                    onClick={loadMore}
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    disabled={loadingMore || !data?.hasMore}
                >
                    {loadingMore
                        ? 'Loading…'
                        : data?.hasMore
                        ? 'Load more'
                        : 'No more'}
                </button>
            </div>
        </aside>
    );
}

function Avatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    return (
        <div className="size-9 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold shrink-0">
            {initials}
        </div>
    );
}
