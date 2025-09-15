'use client';

import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    useGetMessagesQuery,
    useNewMessageMutation,
} from '@/redux/features/message/messageApi';
import { useGetConversationQuery } from '@/redux/features/conversation/conversationApi';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { Input } from '../ui/input';
import ApiError from '../shared/ApiError';
import { Skeleton } from '../ui/skeleton';
import { IConversation } from '@/types/conversation.interface';
import { IMessage } from '@/types/message.interface';
import { socket } from '@/lib/socket';
import { useUpdateUserMutation } from '@/redux/features/users/userApi';

export default function MessageContent({
    conversationID,
}: {
    conversationID: string;
}) {
    const { user } = useLoggedInUser();
    console.log(user?.isOnline);

    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: conversationData, isLoading: isConversationLoading } =
        useGetConversationQuery(conversationID, {
            skip: !conversationID,
        });

    const conversation: IConversation =
        (!isConversationLoading &&
            conversationData &&
            conversationData?.conversation) ??
        [];

    const conversationUser = conversation?.participants?.find(
        (p) => p.role === 'user'
    );

    const [cursor, setCursor] = useState<string | null>(null);

    const { data, isFetching, refetch } = useGetMessagesQuery(
        {
            userID: user?.userID,
            conversationID,
            rawLimit: 50,
            cursor: cursor ?? undefined,
        },
        {
            skip: !user?.userID || !conversationID,
        }
    );

    const messages: IMessage[] = data?.data?.messages ?? [];
    const nextCursor = data?.data?.nextCursor ?? null;

    const [text, setText] = useState('');
    const [sendMessage, { isLoading: sending }] = useNewMessageMutation();

    const doSend = async () => {
        if (!text.trim()) return;

        try {
            const res = await sendMessage({
                conversationID,
                text: text.trim(),
                senderID: user?.userID,
            });

            if (res.data?.success) {
                setText('');
                inputRef.current?.focus();
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const [updateUser] = useUpdateUserMutation();

    // Socket connection and real-time message handling
    useEffect(() => {
        if (!conversationID || !user?.userID) return;

        console.log('Joining conversation:', conversationID);

        // Join the conversation room
        socket.emit('conversation:join', {
            conversationID,
            userID: user.userID,
        });

        // Listen for new messages
        const handleNewMessage = (message: IMessage) => {
            console.log('New message received:', message);
            // Refetch messages to get the latest data
            refetch();
        };

        socket.on('new-message', handleNewMessage);

        // Cleanup function
        return () => {
            socket.off('new-message', handleNewMessage);
            socket.emit('conversation:leave', {
                conversationID,
                userID: user.userID,
            });

            // Update user status to offline when leaving
            updateUser({
                userID: user?.userID,
                data: {
                    isOnline: false,
                },
            });
        };
    }, [conversationID, user?.userID, refetch, updateUser]);

    const topRef = useRef<HTMLDivElement>(null);

    // Intersection observer for pagination
    useEffect(() => {
        if (!topRef.current || !nextCursor || isFetching) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setCursor(nextCursor);
                }
            },
            { threshold: 1 }
        );

        observer.observe(topRef.current);

        return () => {
            observer.disconnect();
        };
    }, [nextCursor, isFetching]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages.length]);

    return (
        <div className="flex h-full min-h-0 flex-col bg-white">
            <div className="shrink-0 border-b px-4 py-3">
                {isConversationLoading ? (
                    <div className="flex items-center gap-3 min-w-0">
                        <Skeleton className="h-9 w-9" />
                        <div className="space-y-2 min-w-0">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[230px]" />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                            <Avatar className="h-9 w-9">
                                <AvatarImage
                                    src={conversationUser?.image}
                                    alt={conversationUser?.name}
                                />
                                <AvatarFallback>
                                    {conversationUser?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {conversationUser?.isOnline ? (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                            ) : (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-gray-500" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                                {conversationUser?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {conversationUser?.email}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div
                ref={listRef}
                className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3"
            >
                <div ref={topRef}></div>
                {messages.map((m) => {
                    const mine = m.authorID === user.userID;
                    const author = mine ? 'Me' : conversationUser?.name;
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
                        <Loader2 className="animate-spin" />
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !sending) {
                                e.preventDefault();
                                doSend();
                            }
                        }}
                        className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Write a message…"
                        disabled={sending}
                    />
                    <Button
                        size="icon"
                        onClick={doSend}
                        disabled={sending || !text.trim()}
                    >
                        {sending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Send />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
