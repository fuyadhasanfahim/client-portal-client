'use client';

import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowUp, Loader2, LogOutIcon, Paperclip } from 'lucide-react';
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
import {
    useGetConversationQuery,
    useJoinConversationMutation,
    useLeaveConversationMutation,
} from '@/redux/features/conversation/conversationApi';
import { IConversation } from '@/types/conversation.interface';
import { motion, AnimatePresence } from 'framer-motion';
import { usePresignUploadMutation } from '@/redux/features/upload/uploadApi';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';

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
    const [joined, setJoined] = useState(false);
    const [showJoinDialog, setShowJoinDialog] = useState(true);

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
        useGetConversationQuery(conversationID, { skip: !conversationID });

    const [joinConversation] = useJoinConversationMutation();
    const [leaveConversation] = useLeaveConversationMutation();
    const [presignUpload] = usePresignUploadMutation();

    const conversation: IConversation =
        conversationData?.conversation ?? ({} as IConversation);

    const conversationUser = conversation?.participants?.find(
        (p) => p.role === 'user'
    );

    useEffect(() => {
        if (!conversation || !user?.userID) return;
        const me = conversation.participants?.find(
            (p) => p.userID === user.userID
        );
        const online = !!me?.isOnline;

        if (online !== joined) {
            setJoined(online);
            setShowJoinDialog(!online);
        }
    }, [conversation, user?.userID]);

    useEffect(() => {
        if (scrollMode === 'append') {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (scrollMode === 'prepend' && scrollRef.current) {
            const el = scrollRef.current;
            const prevHeight = el.scrollHeight;
            requestAnimationFrame(() => {
                const newHeight = el.scrollHeight;
                el.scrollTop = newHeight - prevHeight;
            });
        }
        setScrollMode(null);
    }, [messages, scrollMode]);

    // ✅ Messages from API
    useEffect(() => {
        if (messagesData?.data?.messages) {
            setMessages(
                cursor
                    ? (prev) => [...messagesData.data.messages, ...prev]
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

    // ✅ Socket
    useEffect(() => {
        if (!conversation._id || !user?.userID) return;
        if (!socket.connected) socket.connect();

        const handleNewMessage = (data: {
            message: IMessage;
            userID: string;
        }) => {
            setMessages((prev) => [...prev, data.message]);
            setScrollMode('append');
        };

        // Only join socket room if user has joined the conversation
        if (joined) {
            socket.emit('join-conversation', {
                conversationID: conversation._id,
                userID: user.userID,
            });
        }

        socket.on('new-message', handleNewMessage);

        return () => {
            socket.off('new-message', handleNewMessage);
            // Only leave socket room if user was actually joined
            // if (joined) {
            //     socket.emit('leave-conversation', {
            //         conversationID: conversation._id,
            //         userID: user.userID,
            //     });
            // }
        };
    }, [conversation._id, user?.userID, joined]);

    // ✅ Join / Leave handlers
    const handleJoin = async () => {
        try {
            const res = await joinConversation({
                conversationID,
                userID: user.userID,
            }).unwrap();

            if (res.success) {
                setJoined(true);
                setShowJoinDialog(false);

                socket.emit('join-conversation', {
                    conversationID,
                    userID: user.userID,
                });
            }
        } catch (err) {
            ApiError(err);
        }
    };

    const handleLeave = async () => {
        try {
            // Leave socket room first
            socket.emit('leave-conversation', {
                conversationID,
                userID: user.userID,
            });

            // Then call the API
            await leaveConversation({ conversationID, userID: user.userID });
        } finally {
            setJoined(false);
            setShowJoinDialog(true);
        }
    };

    // ✅ Send message
    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;

        try {
            const res = await joinConversation({
                conversationID,
                userID: user.userID,
            }).unwrap();

            if (res.success) {
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
            }
        } catch (error) {
            ApiError(error);
        }
    };

    // ✅ Load older messages
    const handleLoadMore = () => {
        if (messages.length > 0) {
            setCursor(messages[0]._id);
            setScrollMode('prepend');
        }
    };

    // ✅ File upload
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) {
            alert('Max file size is 50MB');
            return;
        }

        // Check if user has joined
        if (!joined) {
            setShowJoinDialog(true);
            return;
        }

        try {
            const res = await presignUpload({
                fileName: file.name,
                contentType: file.type,
                size: file.size,
                conversationID,
                senderID: user.userID,
            }).unwrap();

            const { url, publicUrl } = res.upload;

            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            await newMessage({
                conversationID,
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

    return (
        <>
            {/* ✅ Join confirmation dialog */}
            {!isConversationLoading && (
                <Dialog
                    open={showJoinDialog && !joined}
                    onOpenChange={setShowJoinDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Join this conversation?</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            Once you join, you'll appear in this chat and the
                            client will be notified.
                        </DialogDescription>
                        <DialogFooter className="flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setShowJoinDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleJoin}>Join</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

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
                        {messages?.filter(Boolean).map((m, i) => {
                            if (!m) return null;

                            if (m?.kind === 'system') {
                                return (
                                    <div
                                        key={i}
                                        className="text-center text-xs text-gray-500 my-2"
                                    >
                                        {m.text}
                                    </div>
                                );
                            }

                            const mine = m?.authorID === user.userID;
                            const author = mine ? 'Me' : conversationUser?.name;

                            return (
                                <motion.div
                                    key={i}
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
                                        {m?.text && (
                                            <p className="whitespace-pre-wrap">
                                                {m?.text}
                                            </p>
                                        )}
                                        {m?.attachment && (
                                            <a
                                                href={m.attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block mt-1 text-xs underline"
                                            >
                                                📎 {m?.attachment.name}
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
                                            {m?.sentAt &&
                                                format(
                                                    new Date(m?.sentAt),
                                                    'p'
                                                )}
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
                {joined ? (
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 150,
                            damping: 18,
                        }}
                        className="shrink-0 border-t px-3 py-3"
                    >
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-2"
                        >
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleLeave}
                            >
                                <LogOutIcon />
                            </Button>
                            <input
                                type="file"
                                hidden
                                id="file-input"
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="file-input">
                                <Button
                                    type="button"
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
                                className="resize-y"
                                placeholder="Write a message…"
                                disabled={isNewMessageSending}
                            />
                            <Button
                                size="icon"
                                type="submit"
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
                ) : (
                    <div>
                        <p className="text-sm text-gray-500 text-center py-2">
                            You have left this chat.
                        </p>
                    </div>
                )}
            </motion.div>
        </>
    );
}
