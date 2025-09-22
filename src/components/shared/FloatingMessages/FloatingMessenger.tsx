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
import { Loader2, Paperclip, ArrowUp, Check, CheckCheck } from 'lucide-react';
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
} from '@/redux/features/conversation/conversationApi';
import { IConversation } from '@/types/conversation.interface';
import { socket } from '@/lib/socket';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
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
    const [isTyping, setIsTyping] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showTypingIndicator, setShowTypingIndicator] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const inputFocusSpring = useSpring(0);

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

    const [presignUpload] = usePresignUploadMutation();

    const conversation: IConversation = React.useMemo(
        () => conversationData?.conversation ?? ({} as IConversation),
        [conversationData]
    );

    useEffect(() => {
        if (!conversation) return;

        setUnreadCount(
            conversation.participants?.find((p) => p.userID === user?.userID)
                ?.unreadCount ?? 0
        );
    }, [conversation, user, setUnreadCount]);

    const conversationUser = conversation?.participants?.find(
        (p) => p.role === 'admin'
    );

    // Animation variants
    const messageVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95,
            filter: 'blur(4px)',
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                type: 'spring' as const,
                stiffness: 200,
                damping: 20,
                mass: 0.8,
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: { duration: 0.2 },
        },
    };

    const sheetVariants = {
        hidden: { x: '100%', opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: 'spring' as const,
                stiffness: 120,
                damping: 20,
                staggerChildren: 0.1,
            },
        },
        exit: {
            x: '100%',
            opacity: 0,
            transition: { duration: 0.3 },
        },
    };

    const headerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 150,
                damping: 25,
                delay: 0.1,
            },
        },
    };

    const footerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 120,
                damping: 15,
                delay: 0.2,
            },
        },
    };

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

    // Typing indicator simulation
    useEffect(() => {
        let typingTimeout: NodeJS.Timeout | undefined = undefined;

        if (text.length > 0) {
            setIsTyping(true);
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => setIsTyping(false), 1000);
        } else {
            setIsTyping(false);
        }

        return () => {
            if (typingTimeout) clearTimeout(typingTimeout);
        };
    }, [text]);

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

            // Show typing indicator briefly for admin messages
            if (data.message.authorID !== user.userID) {
                setShowTypingIndicator(true);
                setTimeout(() => setShowTypingIndicator(false), 500);
            }

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
    }, [conversation, user?.userID, open, setUnreadCount]);

    // ✅ join/leave lifecycle
    // useEffect(() => {
    //     if (conversation._id && user.userID) {
    //         joinConversation({
    //             conversationID: conversation._id,
    //             userID: user.userID,
    //         });
    //         return () => {
    //             leaveConversation({
    //                 conversationID: conversation._id,
    //                 userID: user.userID,
    //             });
    //         };
    //     }
    // }, [conversation, user.userID, joinConversation, leaveConversation]);

    // ✅ send message with enhanced UX
    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;

        const messageText = text;
        setText(''); // Clear immediately for better UX

        try {
            const res = await newMessage({
                conversationID: user?.conversationID,
                text: messageText,
                senderID: user?.userID,
            }).unwrap();
            if (res?.success) {
                setScrollMode('append');
                requestAnimationFrame(() => inputRef.current?.focus());
            }
        } catch (error) {
            setText(messageText); // Restore text on error
            console.log(error);
            ApiError(error);
        }
    };

    // ✅ enhanced file upload with progress
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            alert('Max file size is 50MB');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const res = await presignUpload({
                fileName: file.name,
                contentType: file.type,
                size: file.size,
                conversationID: conversation._id,
                senderID: user.userID,
            }).unwrap();

            console.log(res);

            const { url, publicUrl } = res.upload;

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 100);

            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

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
            console.log(err);
            ApiError(err);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleLoadMore = () => {
        if (messages.length > 0) {
            setCursor(messages[0]._id);
            setScrollMode('prepend');
        }
    };

    const handleInputFocus = () => {
        inputFocusSpring.set(1);
    };

    const handleInputBlur = () => {
        inputFocusSpring.set(0);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="sm:max-w-md p-0 flex h-full flex-col overflow-hidden !gap-0 border-l-2 border-orange-100"
            >
                <motion.div
                    variants={sheetVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex h-full flex-col bg-gradient-to-b from-white to-gray-50/30"
                >
                    {/* Enhanced Header */}
                    <motion.div variants={headerVariants}>
                        <SheetHeader className="px-4 py-4 border-b bg-white/80 backdrop-blur-sm shadow-sm shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <motion.div
                                    className="relative"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 17,
                                    }}
                                >
                                    <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-orange-200 transition-all duration-300">
                                        <AvatarImage
                                            src={conversationUser?.image}
                                            alt={conversationUser?.name}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold">
                                            {conversationUser?.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{
                                            scale: conversationUser?.isOnline
                                                ? 1
                                                : 0.8,
                                            backgroundColor:
                                                conversationUser?.isOnline
                                                    ? '#10b981'
                                                    : '#6b7280',
                                        }}
                                        className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
                                    />
                                </motion.div>
                                <div className="min-w-0 flex-1">
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="font-semibold text-sm truncate text-gray-900"
                                    >
                                        {conversationUser?.name}
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-xs text-gray-500 truncate"
                                    >
                                        {conversationUser?.isOnline ? (
                                            <span className="text-emerald-600 font-medium">
                                                Online
                                            </span>
                                        ) : (
                                            conversationUser?.lastSeenAt &&
                                            formatDistanceToNow(
                                                new Date(
                                                    conversationUser.lastSeenAt
                                                ),
                                                { addSuffix: true }
                                            )
                                        )}
                                    </motion.p>
                                </div>
                            </div>
                            <SheetTitle className="sr-only" />
                            <SheetDescription className="sr-only" />
                        </SheetHeader>
                    </motion.div>

                    {/* Enhanced Messages Container */}
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
                        <div className="px-4 py-4 space-y-4">
                            {isMessagesLoading && !messages.length && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-full h-32 flex items-center justify-center"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    >
                                        <Loader2 className="w-6 h-6 text-orange-500" />
                                    </motion.div>
                                </motion.div>
                            )}

                            <AnimatePresence initial={false} mode="popLayout">
                                {messages?.filter(Boolean).map((m, i) => {
                                    if (!m) return null;

                                    if (m?.kind === 'system') {
                                        return (
                                            <motion.div
                                                key={m._id || i}
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.8,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.8,
                                                }}
                                                className="text-center text-xs text-gray-500 my-4 px-3 py-2 bg-gray-100/50 rounded-full mx-auto w-fit backdrop-blur-sm"
                                            >
                                                {m?.text}
                                            </motion.div>
                                        );
                                    }

                                    const mine = m?.authorID === user?.userID;
                                    const author = mine
                                        ? 'You'
                                        : conversationUser?.name;
                                    const isLastMessage =
                                        i === messages.length - 1;

                                    return (
                                        <motion.div
                                            key={m._id || i}
                                            layout
                                            variants={messageVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className={`flex ${
                                                mine
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            }`}
                                        >
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.02,
                                                    y: -2,
                                                    boxShadow: mine
                                                        ? '0 8px 25px rgba(251, 146, 60, 0.25)'
                                                        : '0 8px 25px rgba(0, 0, 0, 0.1)',
                                                }}
                                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm backdrop-blur-sm relative ${
                                                    mine
                                                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md'
                                                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                                                }`}
                                            >
                                                {m.text && (
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{
                                                            delay: 0.1,
                                                        }}
                                                        className="whitespace-pre-wrap leading-relaxed"
                                                    >
                                                        {m?.text}
                                                    </motion.p>
                                                )}
                                                {m.attachment && (
                                                    <motion.a
                                                        initial={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            delay: 0.2,
                                                        }}
                                                        href={m.attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex items-center gap-2 mt-2 p-2 rounded-lg text-xs underline transition-colors ${
                                                            mine
                                                                ? 'bg-white/20 hover:bg-white/30'
                                                                : 'bg-gray-50 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <Paperclip className="w-3 h-3" />
                                                        {m.attachment.name}
                                                    </motion.a>
                                                )}
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className={`flex items-center justify-between mt-2 text-[10px] ${
                                                        mine
                                                            ? 'text-white/70'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    <span>
                                                        {author} •{' '}
                                                        {formatDistanceToNow(
                                                            new Date(m.sentAt),
                                                            { addSuffix: true }
                                                        )}
                                                    </span>
                                                    {mine && (
                                                        <motion.div
                                                            initial={{
                                                                scale: 0,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                            }}
                                                            transition={{
                                                                delay: 0.5,
                                                                type: 'spring',
                                                                stiffness: 500,
                                                            }}
                                                        >
                                                            {isLastMessage ? (
                                                                <CheckCheck className="w-3 h-3" />
                                                            ) : (
                                                                <Check className="w-3 h-3" />
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Enhanced Typing Indicator */}
                            <AnimatePresence>
                                {(showTypingIndicator ||
                                    (isTyping &&
                                        messages.some(
                                            (m) => m.authorID !== user.userID
                                        ))) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                            <div className="flex space-x-1">
                                                {[0, 1, 2].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{
                                                            scale: [1, 1.5, 1],
                                                            opacity: [
                                                                0.5, 1, 0.5,
                                                            ],
                                                        }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            delay: i * 0.2,
                                                        }}
                                                        className="w-2 h-2 bg-gray-400 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={bottomRef} />
                        </div>
                    </ScrollArea>

                    {/* Enhanced Footer */}
                    <motion.div
                        variants={footerVariants}
                        className="border-t p-4 shrink-0 bg-white/80 backdrop-blur-sm shadow-lg"
                    >
                        {/* Upload Progress */}
                        <AnimatePresence>
                            {isUploading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200"
                                >
                                    <div className="flex items-center justify-between text-sm text-blue-700 mb-1">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-1.5">
                                        <motion.div
                                            className="bg-blue-600 h-1.5 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${uploadProgress}%`,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-3"
                        >
                            <input
                                type="file"
                                hidden
                                id="client-file-input"
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="client-file-input">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        disabled={
                                            isNewMessageSending || isUploading
                                        }
                                        asChild
                                        className="shadow-md hover:shadow-lg transition-shadow rounded-full"
                                    >
                                        <div>
                                            {isUploading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Paperclip className="w-4 h-4" />
                                            )}
                                        </div>
                                    </Button>
                                </motion.div>
                            </label>

                            <motion.div
                                className="flex-1 relative"
                                animate={{
                                    scale:
                                        inputFocusSpring.get() === 1 ? 1.02 : 1,
                                }}
                            >
                                <Input
                                    ref={inputRef}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                    placeholder="Write a message…"
                                    disabled={isNewMessageSending}
                                    className="resize-none shadow-md focus:shadow-lg transition-all duration-300 bg-gray-50/50 border-gray-200 focus:bg-white rounded-full py-3"
                                />
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Button
                                    size="icon"
                                    disabled={
                                        isNewMessageSending || !text.trim()
                                    }
                                    className="shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full"
                                    asChild
                                >
                                    <div>
                                        {isNewMessageSending ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                            >
                                                <Loader2 className="w-4 h-4" />
                                            </motion.div>
                                        ) : (
                                            <ArrowUp className="w-4 h-4" />
                                        )}
                                    </div>
                                </Button>
                            </motion.div>
                        </form>
                    </motion.div>
                </motion.div>
            </SheetContent>
        </Sheet>
    );
}
