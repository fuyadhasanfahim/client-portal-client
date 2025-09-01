'use client';

import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    useGetMessagesQuery,
    useSendMessageMutation,
    type Message,
} from '@/redux/features/message/messageApi';
import { useGetConversationQuery } from '@/redux/features/conversation/conversationApi';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { Input } from '../ui/input';
import ApiError from '../shared/ApiError';
import { Skeleton } from '../ui/skeleton';
import { IConversation } from '@/types/conversation.interface';

export default function MessageContent({
    conversationID,
}: {
    conversationID: string;
}) {
    const { user } = useLoggedInUser();
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

    const { data, isFetching } = useGetMessagesQuery({
        conversationID,
        limit: 50,
        cursor: null,
    });
    const messages: Message[] = data?.items ?? [];

    const [text, setText] = useState('');
    const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
    console.log(sendMessage);

    const doSend = async () => {
        try {
            console.log('Sending the message');
        } catch (error) {
            ApiError(error);
        } finally {
        }
    };

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
                                    {conversationUser?.name
                                        ?.split(' ')
                                        .map((x) => x[0])
                                        .join('')}
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
