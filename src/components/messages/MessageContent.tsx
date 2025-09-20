'use client';

import React, { useEffect, useState } from 'react';
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

export default function MessageContent({
    conversationID,
}: {
    conversationID: string;
}) {
    const { user } = useLoggedInUser();

    const [messages, setMessages] = useState<IMessage[] | []>([]);
    const [text, setText] = useState('');

    const { data: messagesData, isLoading: isMessagesLoading } =
        useGetMessagesQuery({
            userID: user?.userID,
            conversationID,
            rawLimit: 25,
            cursor: '',
        });

    const [newMessage, { isLoading: isNewMessageSending }] =
        useNewMessageMutation();

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
                conversationID,
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
        if (!conversationID || !user.userID) return;

        if (!socket.connected) socket.connect();

        const joinRoom = () => {
            socket.emit('join-conversation', conversationID);
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
            socket.emit('leave-conversation', conversationID);
        };
    }, [conversationID, user?.userID]);

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

            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((m, i) => {
                    const mine = m.authorID === user.userID;
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
                                        mine ? 'text-white/80' : 'text-gray-500'
                                    }`}
                                >
                                    {author} • {format(new Date(m.sentAt), 'p')}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isMessagesLoading && !messages.length && (
                    <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="animate-spin" />
                    </div>
                )}
            </div>

            <div className="shrink-0 border-t px-3 py-3">
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
            </div>
        </div>
    );
}
