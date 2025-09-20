'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
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
import { useGetConversationQuery } from '@/redux/features/conversation/conversationApi';
import { IConversation } from '@/types/conversation.interface';
import { socket } from '@/lib/socket';

type FloatingMessengerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: ISanitizedUser;
    footerExtras?: React.ReactNode;
};

export default function FloatingMessenger({
    open,
    onOpenChange,
    user,
}: FloatingMessengerProps) {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState<IMessage[] | []>([]);
    const [cursor, setCursor] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
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
            {
                skip: !user?.userID,
            }
        );

    const { data: conversationData, isLoading: isConversationLoading } =
        useGetConversationQuery(user?.conversationID, {
            skip: !user?.conversationID,
        });

    const conversation: IConversation =
        (!isConversationLoading &&
            conversationData &&
            conversationData?.conversation) ??
        [];

    const conversationUser = conversation?.participants?.find(
        (p) => p.role === 'admin'
    );

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (messagesData?.data?.messages) {
            setMessages((prev) =>
                cursor
                    ? [...messagesData.data.messages, ...prev]
                    : messagesData.data.messages
            );
        }
    }, [messagesData]);

    useEffect(() => {
        if (!conversation._id || !user?.userID) return;

        if (!socket.connected) socket.connect();

        const handleNewMessage = (data: {
            message: IMessage;
            userID: string;
        }) => {
            console.log('New message:', data.message);
            setMessages((prev) => [...prev, data.message]);
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

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();

            const res = await newMessage({
                conversationID: user?.conversationID,
                text,
                senderID: user?.userID,
            }).unwrap();

            if (res?.success) {
                setText('');
                inputRef.current?.focus();
            }
        } catch (error) {
            ApiError(error);
        }
    };

    const handleLoadMore = () => {
        if (messages.length > 0) {
            setCursor(messages[0]._id);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="sm:max-w-md p-0 flex h-full flex-col overflow-hidden !gap-0"
            >
                <SheetHeader className="px-4 py-3 border-b shrink-0">
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
                                {conversationUser?.lastSeenAt &&
                                    formatDistanceToNow(
                                        new Date(conversationUser.lastSeenAt),
                                        { addSuffix: true }
                                    )}
                            </p>
                        </div>
                    </div>

                    {isMessagesLoading && !messages.length && (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}

                    <SheetTitle className="sr-only"></SheetTitle>
                    <SheetDescription className="sr-only"></SheetDescription>
                </SheetHeader>

                <ScrollArea
                    className="min-h-0"
                    onScroll={(e) => {
                        const target = e.currentTarget;
                        if (target.scrollTop === 0 && !isMessagesLoading) {
                            handleLoadMore();
                        }
                    }}
                >
                    <div className="flex-1 px-4 min-h-full py-3 !space-y-3">
                        {messages.map((m, i) => {
                            const mine = m.authorID === user?.userID;
                            const author = mine ? 'Me' : conversationUser?.name;
                            return (
                                <div
                                    key={i}
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
                                                mine
                                                    ? 'text-white/80'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {author} •{' '}
                                            {conversation.lastMessageAt &&
                                                formatDistanceToNow(
                                                    new Date(
                                                        conversation.lastMessageAt
                                                    ),
                                                    { addSuffix: true }
                                                )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>
                </ScrollArea>

                {/* Footer should never disappear; keep it shrink-0 */}
                <div className="border-t p-3 shrink-0 bg-white">
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-2"
                    >
                        <Button
                            size={'icon'}
                            variant={'secondary'}
                            disabled={isNewMessageSending}
                        >
                            <Paperclip />
                        </Button>
                        <Input
                            autoFocus
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
                        >
                            {isNewMessageSending ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <ArrowUp />
                            )}
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
