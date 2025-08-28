'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    useGetMessagesQuery,
    useLazyGetMessagesQuery,
    useMarkReadUpToMutation,
    useSendMessageMutation,
    type Message,
} from '@/redux/features/message/messageApi';
import {
    useGetConversationsQuery,
    type Conversation,
} from '@/redux/features/conversation/conversationApi';
import { useConversationSocket } from '@/utils/useConversationSocket';
import useLoggedInUser from '@/utils/getLoggedInUser';

export default function MessageContent({
    conversationID,
}: {
    conversationID: string;
}) {
    const { user } = useLoggedInUser();

    const listRef = useRef<HTMLDivElement>(null);

    const { joinConversation, leaveConversation } = useConversationSocket(
        process.env.NEXT_PUBLIC_BASE_URL!,
        user.userID
    );
    useEffect(() => {
        joinConversation(conversationID);
        leaveConversation(conversationID);
    }, [conversationID, joinConversation, leaveConversation]);

    // header info
    const { data: convPage } = useGetConversationsQuery({
        userID: user.userID,
        limit: 20,
        cursor: null,
    });
    const conversation: Conversation | undefined = useMemo(
        () => convPage?.items.find((c) => c._id === conversationID),
        [convPage?.items, conversationID]
    );
    const otherUser = useMemo(
        () =>
            conversation
                ? conversation.participants.find(
                      (p) => p.userID !== user.userID
                  ) ?? conversation.participants[0]
                : undefined,
        [conversation]
    );
    const initials = (otherUser?.name ?? 'User')
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // messages (base page)
    const { data, isFetching } = useGetMessagesQuery({
        conversationID,
        limit: 20,
        cursor: null, // keep null so the socket cache updates apply here
    });

    // “older” pages are held locally and prepended
    const [older, setOlder] = useState<Message[]>([]);
    const [fetchOlder, { isFetching: loadingOlder }] =
        useLazyGetMessagesQuery();

    const merged: Message[] = useMemo(
        () => [...older, ...(data?.items ?? [])],
        [older, data?.items]
    );

    const loadOlder = async () => {
        if (!data?.hasMore || loadingOlder) return;
        const res = await fetchOlder({
            conversationID,
            limit: 20,
            cursor: data.nextCursor ?? null,
        }).unwrap();
        setOlder((prev) => [...res.items, ...prev]); // prepend older
    };

    // auto-scroll to bottom when new base items arrive
    useEffect(() => {
        const el = listRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [data?.items?.length]);

    // send
    const [text, setText] = useState('');
    const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
    const doSend = async () => {
        const body = text.trim();
        if (!body) return;
        setText('');
        await sendMessage({
            conversationID,
            authorId: user.userID,
            text: body,
        });
        // socket will push it into the base cache; we scroll down
        requestAnimationFrame(() => {
            const el = listRef.current;
            if (el) el.scrollTop = el.scrollHeight;
        });
    };

    // mark read up to newest message
    const [markReadUpTo] = useMarkReadUpToMutation();
    useEffect(() => {
        const last = merged[merged.length - 1];
        if (!last?._id) return;
        markReadUpTo({
            conversationID,
            userID: user.userID,
            upToMessageId: last._id,
        });
    }, [merged.length, conversationID, markReadUpTo]);

    return (
        <div className="flex h-full min-h-0 flex-col bg-white">
            {/* Header */}
            <div className="shrink-0 border-b px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                        <Avatar className="h-9 w-9">
                            <AvatarImage
                                src={otherUser?.image}
                                alt={otherUser?.name}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                            {otherUser?.name ?? 'Admin'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize truncate">
                            {otherUser?.isOnline ? 'online' : 'offline'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="px-4 pt-3">
                <button
                    onClick={loadOlder}
                    className="mb-2 text-xs border px-2 py-1 rounded"
                    disabled={loadingOlder || !data?.hasMore}
                >
                    {loadingOlder
                        ? 'Loading older…'
                        : data?.hasMore
                        ? 'Load older'
                        : 'No more'}
                </button>
            </div>

            <div
                ref={listRef}
                className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-3"
            >
                {merged.map((m) => {
                    const mine = m.authorId === user.userID;
                    const author = mine ? 'You' : otherUser?.name ?? 'Admin';
                    return (
                        <div
                            key={m._id}
                            className={`flex ${
                                mine ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                                    mine
                                        ? 'bg-orange-500 text-white rounded-br-none'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                }`}
                            >
                                {m.text && (
                                    <p className="whitespace-pre-wrap">
                                        {m.text}
                                    </p>
                                )}
                                <div
                                    className={`mt-1 text-[10px] ${
                                        mine ? 'text-white/80' : 'text-gray-500'
                                    }`}
                                >
                                    {author} • {format(new Date(m.sentAt), 'p')}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isFetching && !data?.items?.length && (
                    <div className="text-center text-[11px] text-gray-500 mt-2">
                        Loading…
                    </div>
                )}
            </div>

            {/* Composer */}
            <div className="shrink-0 border-t px-3 py-3">
                <div className="flex items-center gap-2">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === 'Enter' && !e.shiftKey && doSend()
                        }
                        className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Write a message…"
                        disabled={sending}
                    />
                    <Button size="icon" onClick={doSend} disabled={sending}>
                        <Send />
                    </Button>
                </div>
            </div>
        </div>
    );
}
