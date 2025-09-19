'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { useNewMessageMutation } from '@/redux/features/message/messageApi';
import ApiError from '../ApiError';
import { format, formatDistanceToNow } from 'date-fns';
import { useGetConversationQuery } from '@/redux/features/conversation/conversationApi';
import { IConversation } from '@/types/conversation.interface';
import { IMessage } from '@/types/message.interface';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetUserInfoQuery } from '@/redux/features/users/userApi';
import { socket } from '@/lib/socket';
import { Input } from '@/components/ui/input';

type FloatingMessengerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    conversationID: string;
    userID: string;
    messages: IMessage[];
    sending?: boolean;
    title?: string;
    footerExtras?: React.ReactNode;
    onMessagesRefetch?: () => void;
};

export default function FloatingMessenger({
    open,
    onOpenChange,
    conversationID,
    userID,
    messages,
    sending = false,
    footerExtras,
    onMessagesRefetch,
}: FloatingMessengerProps) {
    const [text, setText] = React.useState('');
    const bottomRef = React.useRef<HTMLDivElement>(null);
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);

    const [sendMessage, { isLoading }] = useNewMessageMutation();

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

    const { data: userData } = useGetUserInfoQuery(conversationUser?.userID, {
        skip: !conversationUser?.userID,
    });

    const handleSend = async () => {
        if (!text.trim()) return;

        try {
            const res = await sendMessage({
                conversationID,
                text: text.trim(),
                senderID: userID,
            }).unwrap();

            if (res.success) {
                setText('');
            }
        } catch (error) {
            ApiError(error);
        }
    };

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
            e.preventDefault();
            void handleSend();
        }
    }

    // Socket connection for real-time messages
    React.useEffect(() => {
        if (!open || !conversationID || !userID) return;

        console.log('FloatingMessenger: Joining conversation', conversationID);

        // Join the conversation room
        socket.emit('conversation:join', {
            conversationID,
            userID,
        });

        // Listen for new messages
        const handleNewMessage = (message: IMessage) => {
            console.log('FloatingMessenger: New message received', message);
            // Trigger refetch from parent component
            onMessagesRefetch?.();
        };

        socket.on('new-message', handleNewMessage);

        return () => {
            socket.off('new-message', handleNewMessage);
            socket.emit('conversation:leave', {
                conversationID,
                userID,
            });
        };
    }, [open, conversationID, userID, onMessagesRefetch]);

    // Auto-scroll to bottom on new messages
    React.useEffect(() => {
        if (bottomRef.current && scrollAreaRef.current) {
            bottomRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            });
        }
    }, [messages.length]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {/* Make the content a flex column and prevent outer overflow */}
            <SheetContent
                side="right"
                className="sm:max-w-md p-0 flex h-full flex-col overflow-hidden"
            >
                <SheetHeader className="px-4 py-3 border-b shrink-0">
                    <div className={cn('flex items-center gap-3 transition')}>
                        <div className="relative">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={userData?.data?.image} />
                                <AvatarFallback>
                                    {userData?.data?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {userData?.data?.isOnline ? (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                            ) : (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-gray-500" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-base truncate">
                                {userData?.data?.name}
                            </p>
                            <span className="text-[11px] text-gray-400 shrink-0">
                                {conversation.lastMessageAt &&
                                    formatDistanceToNow(
                                        new Date(conversation.lastMessageAt),
                                        { addSuffix: true }
                                    )}
                            </span>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0 px-3">
                    <div className="space-y-3 py-3">
                        <AnimatePresence initial={false}>
                            {messages.map((m) => {
                                const mine = m.authorID === userID;
                                const author = mine
                                    ? 'Me'
                                    : conversationUser?.name;
                                return (
                                    <motion.div
                                        key={m._id}
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
                                                    mine
                                                        ? 'text-white/80'
                                                        : 'text-gray-500'
                                                }`}
                                            >
                                                {author} •{' '}
                                                {format(
                                                    new Date(m.sentAt),
                                                    'p'
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* anchor to keep view pinned to bottom */}
                        <div ref={bottomRef} />
                    </div>
                </ScrollArea>

                {/* Footer should never disappear; keep it shrink-0 */}
                <div className="border-t p-3 shrink-0 bg-white">
                    <div className="flex items-end gap-2">
                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (
                                    e.key === 'Enter' &&
                                    !e.shiftKey &&
                                    !isLoading
                                ) {
                                    e.preventDefault();
                                    void handleSend();
                                }
                            }}
                            placeholder="Write a message…  (Enter to send)"
                            className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                            disabled={isLoading}
                        />

                        <Button
                            onClick={() => void handleSend()}
                            disabled={!text.trim() || sending || isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Send />
                            )}
                        </Button>
                    </div>

                    {footerExtras ? (
                        <div className="mt-2">{footerExtras}</div>
                    ) : null}
                </div>
            </SheetContent>
        </Sheet>
    );
}
