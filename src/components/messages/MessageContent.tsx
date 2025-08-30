'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    useGetMessagesQuery,
    useSendMessageMutation,
    type Message,
} from '@/redux/features/message/messageApi';
import { useGetConversationsQuery } from '@/redux/features/conversation/conversationApi';
import { useConversationSocket } from '@/utils/useConversationSocket';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { Input } from '../ui/input';
import ApiError from '../shared/ApiError';

export default function MessageContent({
    conversationID,
}: {
    conversationID: string;
}) {
    const { user } = useLoggedInUser();
    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Join the conversation room for realtime updates
    useConversationSocket(process.env.NEXT_PUBLIC_API_URL ?? '', {
        kind: 'conversation',
        conversationID,
    });

    // Header info (normalized list item: userName/userEmail/userImage)
    const { data: convPage } = useGetConversationsQuery({
        limit: 50,
        cursor: null,
    });
    const conversation = useMemo(
        () => convPage?.items.find((c) => c._id === conversationID),
        [convPage?.items, conversationID]
    );
    const initials = (conversation?.userName ?? 'User')
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // Messages (single cache for this conversation)
    const { data, isFetching } = useGetMessagesQuery({
        conversationID,
        limit: 50,
        cursor: null,
    });
    const messages: Message[] = data?.items ?? [];

    // Auto-scroll to bottom when new items arrive
    useEffect(() => {
        const el = listRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [messages.length]);

    // Focus the composer on mount & when convo changes
    useEffect(() => {
        // focus after mount/hydration
        const r = requestAnimationFrame(() => inputRef.current?.focus());
        return () => cancelAnimationFrame(r);
    }, [conversationID]);

    // Send message
    const [text, setText] = useState('');
    const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

    const doSend = async () => {
        try {
            const body = text.trim();
            if (!body) return;
            setText('');
            await sendMessage({
                conversationID,
                text: body,
                // authorID: user.userID,
            }).unwrap();
            requestAnimationFrame(() => {
                const el = listRef.current;
                if (el) el.scrollTop = el.scrollHeight;
            });
        } catch (error) {
            ApiError(error);
        } finally {
            // ensure focus returns to the input after sending
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col bg-white">
            {/* Header */}
            <div className="shrink-0 border-b px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                        <Avatar className="h-9 w-9">
                            <AvatarImage
                                src={conversation?.userImage}
                                alt={conversation?.userName}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                            {conversation?.userName ?? 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {conversation?.userEmail ?? ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={listRef}
                className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3"
            >
                {messages.map((m) => {
                    const mine = m.authorID === user.userID; // compare to logged-in admin/user ID
                    const author = mine
                        ? 'You'
                        : conversation?.userName ?? 'User';
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
                                {!!m.text && (
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

                {isFetching && !messages.length && (
                    <div className="text-center text-[11px] text-gray-500 mt-2">
                        Loading…
                    </div>
                )}
            </div>

            {/* Composer */}
            <div className="shrink-0 border-t px-3 py-3">
                <div className="flex items-center gap-2">
                    <Input
                        ref={inputRef}
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
