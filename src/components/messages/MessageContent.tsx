'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatMessage, messagesSeed, people } from './data';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MessageContent({
    conversationID,
}: {
    conversationID: string;
}) {
    const all = useMemo(
        () =>
            messagesSeed
                .filter((m) => m.conversationID === conversationID)
                .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime()),
        [conversationID]
    );

    const [messages, setMessages] = useState<ChatMessage[]>(all);
    const [text, setText] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => endRef.current?.scrollIntoView({ behavior: 'smooth' }),
        [messages]
    );

    const send = () => {
        if (!text.trim()) return;
        const newMsg: ChatMessage = {
            _id: Math.random().toString(36).slice(2),
            conversationID,
            authorId: 'me',
            text: text.trim(),
            sentAt: new Date(),
        };
        setMessages((prev) => [...prev, newMsg]);
        setText('');
    };

    const otherId = useMemo(() => {
        const ids = new Set(
            messagesSeed
                .filter((m) => m.conversationID === conversationID)
                .map((m) => m.authorId)
        );
        ids.delete('me');
        return Array.from(ids)[0];
    }, [conversationID]);

    const otherUser = useMemo(
        () => people.find((p) => p.userID === otherId),
        [otherId]
    );

    // presence -> dot color
    const presenceDot = (p?: 'online' | 'away' | 'offline') => {
        if (p === 'online') return 'bg-emerald-500';
        if (p === 'away') return 'bg-amber-500';
        return 'bg-gray-400';
    };

    // initials for fallback
    const initials = (otherUser?.name ?? 'User')
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="flex h-full min-h-0 flex-col bg-white">
            <div className="shrink-0 border-b px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar + presence dot */}
                    <div className="relative">
                        <Avatar className="h-9 w-9">
                            <AvatarImage
                                src={otherUser?.image}
                                alt={otherUser?.name}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${presenceDot(
                                otherUser?.isOnline as any
                            )}`}
                        />
                    </div>

                    {/* Name + presence label */}
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                            {otherUser?.name ?? 'Admin'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize truncate">
                            {otherUser?.isOnline ?? 'online'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((m) => {
                    const mine = m.authorId === 'me';
                    const author =
                        people.find((p) => p.userID === m.authorId)?.name ??
                        (mine ? 'You' : 'Admin');

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
                                <p className="whitespace-pre-wrap">{m.text}</p>
                                <div
                                    className={`mt-1 text-[10px] ${
                                        mine ? 'text-white/80' : 'text-gray-500'
                                    }`}
                                >
                                    {author} • {format(m.sentAt, 'p')}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>

            <div className="shrink-0 border-t px-3 py-3">
                <div className="flex items-center gap-2">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && send()}
                        className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Write a message…"
                    />
                    <Button size="icon" onClick={send}>
                        <Send />
                    </Button>
                </div>
            </div>
        </div>
    );
}
