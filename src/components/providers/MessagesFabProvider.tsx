'use client';

import React from 'react';
import FloatingMessenger from '@/components/shared/FloatingMessages/FloatingMessenger';
import FloatingMessageButton from '@/components/shared/FloatingMessages/FloatingMessageButton';

export default function MessagesFabProvider() {
    const [open, setOpen] = React.useState(false);
    const [messages, setMessages] = React.useState([
        {
            _id: 'm1',
            authorId: 'admin',
            text: 'Hi! How can we help today?',
            sentAt: new Date(Date.now() - 1000 * 60 * 3),
        },
        {
            _id: 'm2',
            authorId: 'me',
            text: 'Quick question about my order…',
            sentAt: new Date(Date.now() - 1000 * 60 * 2),
        },
    ]);

    async function handleSend({ text }: { text: string }) {
        const newMsg = {
            _id: crypto.randomUUID(),
            authorId: 'me',
            text,
            sentAt: new Date(),
        };
        setMessages((prev) => [...prev, newMsg]);
    }

    const unreadCount = 2;

    return (
        <>
            <FloatingMessenger
                open={open}
                onOpenChange={setOpen}
                currentUserId="me"
                messages={messages}
                onSend={handleSend}
                title="Support"
            />

            <FloatingMessageButton
                isOpen={open}
                onToggle={() => setOpen((v) => !v)}
                unreadCount={unreadCount}
            />
        </>
    );
}
