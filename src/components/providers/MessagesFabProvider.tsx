/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { io, Socket } from 'socket.io-client';
import FloatingMessenger from '@/components/shared/FloatingMessages/FloatingMessenger';
import FloatingMessageButton from '@/components/shared/FloatingMessages/FloatingMessageButton';
import { useLazyStartSupportQuery } from '@/redux/features/support/supportApi';
import { useSendMessageMutation } from '@/redux/features/message/messageApi';
import useLoggedInUser from '@/utils/getLoggedInUser';
import TestMessage from '../message';

/** UI message shape expected by <FloatingMessenger /> */
type ChatMessage = {
    _id: string;
    authorId: string;
    text?: string;
    sentAt: string | Date;
    attachments?: Array<{
        url: string;
        name?: string;
        mimeType?: string;
        sizeBytes?: number;
        thumbnailUrl?: string;
    }>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export default function MessagesFabProvider() {
    const { user } = useLoggedInUser();

    const [open, setOpen] = React.useState(false);
    const [conversationId, setConversationId] = React.useState<string | null>(
        null
    );
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);

    // API hooks
    const [triggerStart, { isFetching: starting }] = useLazyStartSupportQuery();
    const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

    // socket
    const socketRef = React.useRef<Socket | null>(null);

    // Helper: map server message -> UI message
    const mapServerMsg = React.useCallback((m: any): ChatMessage => {
        return {
            _id: m._id,
            authorId: m.authorID ?? m.authorId,
            text: m.text,
            sentAt: m.sentAt,
            attachments: m.attachments,
        };
    }, []);

    // Open the panel → ensure conversation exists and load initial messages
    React.useEffect(() => {
        if (!open || conversationId) return;

        (async () => {
            try {
                // POST /support/start -> { conversation, messages }
                const res = await triggerStart({ limit: 50 }).unwrap();
                console.log(res);
                setConversationId(res.conversation._id);
                setMessages((res.messages ?? []).map(mapServerMsg));
            } catch (e) {
                console.error('startSupport failed', e);
            }
        })();
    }, [open, conversationId, triggerStart, mapServerMsg]);

    // Join the socket room for realtime messages once we have a conversation
    React.useEffect(() => {
        if (!open || !conversationId) return;

        if (!socketRef.current) {
            socketRef.current = io(API_BASE, { withCredentials: true });
        }
        const s = socketRef.current;

        s.emit('join-conversation', conversationId);

        const onNew = (m: any) => {
            const ui = mapServerMsg(m);
            // dedupe (in case we also appended on POST success)
            setMessages((prev) =>
                prev.some((x) => x._id === ui._id) ? prev : [...prev, ui]
            );
        };

        s.on('message:new', onNew);

        return () => {
            s.emit('leave-conversation', conversationId);
            s.off('message:new', onNew);
        };
    }, [open, conversationId, mapServerMsg]);

    // Send a message
    async function handleSend({ text }: { text: string }) {
        if (!conversationId) return;
        try {
            // POST /messages/new-messages -> { message }
            const { message } = await sendMessage({
                conversationID: conversationId,
                text,
            }).unwrap();
            const ui = mapServerMsg(message);
            // append immediately; socket broadcast will be deduped by _id
            setMessages((prev) =>
                prev.some((x) => x._id === ui._id) ? prev : [...prev, ui]
            );
        } catch (e) {
            console.error('sendMessage failed', e);
        }
    }

    const currentUserId = user?.userID ?? 'me';
    const unreadCount = 0;

    const isTestDone = false;

    return (
        <>
            {!isTestDone ? (
                <TestMessage open={open} onOpenChange={setOpen} />
            ) : (
                <FloatingMessenger
                    open={open}
                    onOpenChange={setOpen}
                    currentUserId={currentUserId}
                    messages={messages}
                    onSend={handleSend}
                    sending={starting || sending}
                    title="Support"
                />
            )}

            {user && user.role === 'user' && (
                <FloatingMessageButton
                    isOpen={open}
                    onToggle={() => setOpen((v) => !v)}
                    unreadCount={unreadCount}
                />
            )}
        </>
    );
}
