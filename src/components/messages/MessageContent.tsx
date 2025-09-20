'use client';

import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowUp, Loader2, Paperclip } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { IMessage } from '@/types/message.interface';
import ApiError from '../shared/ApiError';
import {
    useGetMessagesQuery,
    useNewMessageMutation,
} from '@/redux/features/message/messageApi';
import { socket } from '@/lib/socket';
import { useGetConversationQuery } from '@/redux/features/conversation/conversationApi';
import { IConversation } from '@/types/conversation.interface';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageContent({
    conversationID,
}: {
    conversationID: string;
}) {
    const { user } = useLoggedInUser();

    const [messages, setMessages] = useState<IMessage[]>([]);
    const [text, setText] = useState('');
    const [cursor, setCursor] = useState<string | null>(null);
    const [scrollMode, setScrollMode] = useState<'append' | 'prepend' | null>(
        null
    );
    const [initialLoad, setInitialLoad] = useState(true);

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const { data: messagesData, isLoading: isMessagesLoading } =
        useGetMessagesQuery(
            {
                userID: user?.userID,
                conversationID,
                rawLimit: 25,
                cursor: cursor ?? '',
            },
            { skip: !user?.userID }
        );

    const [newMessage, { isLoading: isNewMessageSending }] =
        useNewMessageMutation();

    const { data: conversationData, isLoading: isConversationLoading } =
        useGetConversationQuery(user?.conversationID, {
            skip: !user?.conversationID,
        });

    const conversation: IConversation =
        conversationData?.conversation ?? ({} as IConversation);

    const conversationUser = conversation?.participants?.find(
        (p) => p.role === 'user'
    );

    // ✅ Always focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // ✅ Scroll behavior
    useEffect(() => {
        if (scrollMode === 'append') {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (scrollMode === 'prepend' && scrollRef.current) {
            const el = scrollRef.current;
            const prevHeight = el.scrollHeight;
            requestAnimationFrame(() => {
                const newHeight = el.scrollHeight;
                el.scrollTop = newHeight - prevHeight; // preserve scroll
            });
        }
        setScrollMode(null);
    }, [messages, scrollMode]);

    // ✅ Update messages when data comes in
    useEffect(() => {
        if (messagesData?.data?.messages) {
            setMessages(
                cursor
                    ? (prev) => [...messagesData.data.messages, ...prev]
                    : messagesData.data.messages
            );

            // ✅ On very first load, scroll to bottom automatically
            if (!cursor && initialLoad) {
                requestAnimationFrame(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
                });
                setInitialLoad(false);
            }
        }
    }, [messagesData]);

    // ✅ Socket handling
    useEffect(() => {
        if (!conversation._id || !user?.userID) return;
        if (!socket.connected) socket.connect();

        const handleNewMessage = (data: {
            message: IMessage;
            userID: string;
        }) => {
            setMessages((prev) => [...prev, data.message]);

            setScrollMode('append');
            requestAnimationFrame(() => inputRef.current?.focus());
        };

        socket.emit('join-conversation', {
            conversationID: conversation._id,
            userID: user.userID,
        });
        socket.on('new-message', handleNewMessage);

        return () => {
            socket.off('new-message', handleNewMessage);
            socket.emit('leave-conversation', {
                conversationID: conversation._id,
                userID: user.userID,
            });
        };
    }, [conversation._id, user?.userID]);

    // ✅ Send new message
    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;
        try {
            const res = await newMessage({
                conversationID,
                text,
                senderID: user?.userID,
            }).unwrap();

            if (res?.success) {
                setText('');
                setScrollMode('append');
                requestAnimationFrame(() => inputRef.current?.focus());
            }
        } catch (error) {
            ApiError(error);
        }
    };

    // ✅ Load older
    const handleLoadMore = () => {
        if (messages.length > 0) {
            setCursor(messages[0]._id);
            setScrollMode('prepend');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="flex h-full min-h-0 flex-col bg-white"
        >
            {/* Header */}
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
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 min-w-0"
                    >
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
                            <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                                    conversationUser?.isOnline
                                        ? 'bg-emerald-500'
                                        : 'bg-gray-500'
                                }`}
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                                {conversationUser?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {conversationUser?.email}
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3"
                onScroll={(e) => {
                    const target = e.currentTarget;
                    if (target.scrollTop === 0 && !isMessagesLoading) {
                        handleLoadMore();
                    }
                }}
            >
                <AnimatePresence initial={false}>
                    {messages.map((m) => {
                        const mine = m.authorID === user.userID;
                        const author = mine ? 'Me' : conversationUser?.name;
                        return (
                            <motion.div
                                key={m._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${
                                    mine ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
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
                                            mine
                                                ? 'text-white/80'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {author} •{' '}
                                        {format(new Date(m.sentAt), 'p')}
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {isMessagesLoading && !messages.length && (
                    <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="animate-spin" />
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Footer */}
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                className="shrink-0 border-t px-3 py-3"
            >
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2"
                >
                    <Button
                        size="icon"
                        variant="secondary"
                        disabled={isNewMessageSending}
                        asChild
                    >
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <Paperclip />
                        </motion.div>
                    </Button>
                    <Input
                        ref={inputRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="resize-y"
                        placeholder="Write a message…"
                        disabled={isNewMessageSending}
                    />
                    <Button
                        size="icon"
                        disabled={isNewMessageSending || !text.trim()}
                        asChild
                    >
                        <motion.div
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.1 }}
                        >
                            {isNewMessageSending ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <ArrowUp />
                            )}
                        </motion.div>
                    </Button>
                </form>
            </motion.div>
        </motion.div>
    );
}
