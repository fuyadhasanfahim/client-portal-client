'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Paperclip, ArrowUp } from 'lucide-react';
import {
    useGetMessagesQuery,
    useNewMessageMutation,
} from '@/redux/features/message/messageApi';
import ApiError from '../ApiError';
import { formatDistanceToNow } from 'date-fns';
import { IMessage } from '@/types/message.interface';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ISanitizedUser } from '@/types/user.interface';
import {
    useGetConversationQuery,
    useJoinConversationMutation,
    useLeaveConversationMutation,
} from '@/redux/features/conversation/conversationApi';
import { IConversation } from '@/types/conversation.interface';
import { socket } from '@/lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresignUploadMutation } from '@/redux/features/upload/uploadApi';

type FloatingMessengerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: ISanitizedUser;
    setUnreadCount: (unreadCount: number) => void;
};

export default function FloatingMessenger({
    open,
    onOpenChange,
    user,
    setUnreadCount,
}: FloatingMessengerProps) {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [scrollMode, setScrollMode] = useState<'append' | 'prepend' | null>(
        null
    );
    const [initialLoad, setInitialLoad] = useState(true);

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const [newMessage, { isLoading: isNewMessageSending }] =
        useNewMessageMutation();

    const { data: messagesData, isLoading: isMessagesLoading } =
        useGetMessagesQuery(
            {
                userID: user?.userID,
                conversationID: user?.conversationID,
                rawLimit: 25,
                cursor: cursor ?? '',
            },
            { skip: !user?.userID }
        );

    const { data: conversationData } = useGetConversationQuery(
        user?.conversationID,
        {
            skip: !user?.conversationID,
        }
    );

    const [joinConversation] = useJoinConversationMutation();
    const [leaveConversation] = useLeaveConversationMutation();
    const [presignUpload] = usePresignUploadMutation();

    const conversation: IConversation =
        conversationData?.conversation ?? ({} as IConversation);

    useEffect(() => {
        if (!conversation) return;

        setUnreadCount(
            conversation.participants?.find((p) => p.userID === user?.userID)
                ?.unreadCount ?? 0
        );
    }, [conversation, user]);

    const conversationUser = conversation?.participants?.find(
        (p) => p.role === 'admin'
    );

    // ✅ focus input when opening
    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    // ✅ scroll behavior
    useEffect(() => {
        if (scrollMode === 'append') {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (scrollMode === 'prepend' && scrollContainerRef.current) {
            const el = scrollContainerRef.current;
            const prevHeight = el.scrollHeight;
            requestAnimationFrame(() => {
                const newHeight = el.scrollHeight;
                el.scrollTop = newHeight - prevHeight;
            });
        }
        setScrollMode(null);
    }, [messages, scrollMode]);

    // ✅ messages from API
    useEffect(() => {
        if (messagesData?.data?.messages) {
            setMessages((prev) =>
                cursor
                    ? [...messagesData.data.messages, ...prev]
                    : messagesData.data.messages
            );
            if (!cursor && initialLoad) {
                requestAnimationFrame(() => {
                    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
                });
                setInitialLoad(false);
            }
        }
    }, [messagesData, cursor, initialLoad]);

    // ✅ socket handling
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

            // ✅ live unread updates
            setUnreadCount(
                conversation.participants.find((p) => p.userID === user?.userID)
                    ?.unreadCount ?? 0
            );
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
    }, [conversation._id, user?.userID, open, setUnreadCount]);

    // ✅ join/leave lifecycle
    useEffect(() => {
        if (conversation._id && user.userID) {
            joinConversation({
                conversationID: conversation._id,
                userID: user.userID,
            });
            return () => {
                leaveConversation({
                    conversationID: conversation._id,
                    userID: user.userID,
                });
            };
        }
    }, [conversation._id, user.userID]);

    // ✅ send message
    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;
        try {
            const res = await newMessage({
                conversationID: user?.conversationID,
                text,
                senderID: user?.userID,
            }).unwrap();
            if (res?.success) {
                setText('');
                setScrollMode('append');
                requestAnimationFrame(() => inputRef.current?.focus());
            }
        } catch (error) {
            console.log(error);
            ApiError(error);
        }
    };

    // ✅ file upload
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            alert('Max file size is 50MB');
            return;
        }

        try {
            const res = await presignUpload({
                fileName: file.name,
                contentType: file.type,
                size: file.size,
                conversationID: conversation._id,
                senderID: user.userID,
            }).unwrap();

            const { url, publicUrl } = res.upload;

            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            await newMessage({
                conversationID: conversation._id,
                senderID: user.userID,
                attachment: {
                    url: publicUrl,
                    name: file.name,
                    size: file.size,
                    contentType: file.type,
                },
            }).unwrap();
        } catch (err) {
            ApiError(err);
        }
    };

    const handleLoadMore = () => {
        if (messages.length > 0) {
            setCursor(messages[0]._id);
            setScrollMode('prepend');
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="sm:max-w-md p-0 flex h-full flex-col overflow-hidden !gap-0"
            >
                <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="flex h-full flex-col"
                >
                    {/* Header */}
                    <SheetHeader className="px-4 py-3 border-b shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-9 w-9">
                                <AvatarImage
                                    src={conversationUser?.image}
                                    alt={conversationUser?.name}
                                />
                                <AvatarFallback>
                                    {conversationUser?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">
                                    {conversationUser?.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {conversationUser?.lastSeenAt &&
                                        formatDistanceToNow(
                                            new Date(
                                                conversationUser.lastSeenAt
                                            ),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                </p>
                            </div>
                        </div>
                        {isMessagesLoading && !messages.length && (
                            <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="animate-spin" />
                            </div>
                        )}
                        <SheetTitle className="sr-only" />
                        <SheetDescription className="sr-only" />
                    </SheetHeader>

                    {/* Messages */}
                    <ScrollArea
                        ref={scrollContainerRef}
                        onScroll={(e) => {
                            const target = e.currentTarget;
                            if (target.scrollTop === 0 && !isMessagesLoading) {
                                handleLoadMore();
                            }
                        }}
                        className="min-h-0 flex-1"
                    >
                        <div className="px-4 py-3 space-y-3">
                            <AnimatePresence initial={false}>
                                {messages?.filter(Boolean).map((m, i) => {
                                    if (!m) return null;

                                    if (m?.kind === 'system') {
                                        return (
                                            <div
                                                key={i}
                                                className="text-center text-xs text-gray-500 my-2"
                                            >
                                                {m?.text}
                                            </div>
                                        );
                                    }
                                    const mine = m?.authorID === user?.userID;
                                    const author = mine
                                        ? 'Me'
                                        : conversationUser?.name;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex ${
                                                mine
                                                    ? 'justify-end'
                                                    : 'justify-start'
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
                                                        {m?.text}
                                                    </p>
                                                )}
                                                {m.attachment && (
                                                    <a
                                                        href={m.attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block mt-1 text-xs underline"
                                                    >
                                                        📎 {m.attachment.name}
                                                    </a>
                                                )}
                                                <div
                                                    className={`mt-1 text-[10px] ${
                                                        mine
                                                            ? 'text-white/80'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    {author} •{' '}
                                                    {formatDistanceToNow(
                                                        new Date(m.sentAt),
                                                        {
                                                            addSuffix: true,
                                                        }
                                                    )}
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={bottomRef} />
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 120,
                            damping: 15,
                        }}
                        className="border-t p-3 shrink-0 bg-white justify-end"
                    >
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="file"
                                hidden
                                id="client-file-input"
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="client-file-input">
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
                            </label>
                            <Input
                                ref={inputRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Write a message…"
                                disabled={isNewMessageSending}
                            />
                            <Button
                                size="icon"
                                disabled={isNewMessageSending || !text.trim()}
                                asChild
                            >
                                <motion.div
                                    whileTap={{ scale: 0.8 }}
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
            </SheetContent>
        </Sheet>
    );
}
