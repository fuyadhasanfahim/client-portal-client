'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Paperclip, ArrowUp } from 'lucide-react';
import {
    useGetMessagesQuery,
    useNewMessageMutation,
} from '@/redux/features/message/messageApi';
import ApiError from '../ApiError';
import { format, formatDistanceToNow } from 'date-fns';
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
    footerExtras,
}: FloatingMessengerProps) {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState<IMessage[] | []>([]);

    const [newMessage, { isLoading: isNewMessageSending }] =
        useNewMessageMutation();

    const { data: messagesData, isLoading: isMessagesLoading } =
        useGetMessagesQuery({
            userID: user?.userID,
            conversationID: user?.conversationID,
            rawLimit: 25,
            cursor: '',
        });

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
        (p) => p.role === 'user'
    );

    useEffect(() => {
        if (!isMessagesLoading || messagesData) {
            setMessages(messagesData?.data.messages);
        } else {
            setMessages([]);
        }
    }, [messagesData, isMessagesLoading]);

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
                setMessages((pre) => [...pre, res.message]);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    useEffect(() => {
        if (!conversation._id || !user.userID) return;

        if (!socket.connected) socket.connect();

        const joinRoom = () => {
            socket.emit('join-conversation', conversation._id);
        };

        joinRoom();
        socket.on('connect', joinRoom);

        const handleNewMessage = (message: IMessage) => {
            console.log('New message:', message);
            setMessages((pre) => [...pre, message]);
        };

        socket.on('new-message', handleNewMessage);

        return () => {
            socket.off('new-message', handleNewMessage);
            socket.off('connect', joinRoom);
            socket.emit('leave-conversation', conversation._id);
        };
    }, [conversation._id, user?.userID]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="sm:max-w-md p-0 flex h-full flex-col overflow-hidden !gap-0"
            >
                <SheetHeader className="px-4 py-3 border-b shrink-0">
                    <div className={cn('flex items-center gap-3 transition')}>
                        <div className="relative">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.image} />
                                <AvatarFallback>
                                    {user?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {user?.isOnline ? (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                            ) : (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-gray-500" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-base truncate">
                                {user?.name}
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

                    {isMessagesLoading && !messages.length && (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                </SheetHeader>

                <ScrollArea className="min-h-0">
                    <div className="flex-1 px-4 min-h-0 py-3 !space-y-3">
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
                                            {formatDistanceToNow(
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

                    {footerExtras ? (
                        <div className="mt-2">{footerExtras}</div>
                    ) : null}
                </div>
            </SheetContent>
        </Sheet>
    );
}
