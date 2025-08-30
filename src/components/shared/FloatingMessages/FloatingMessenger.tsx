'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils'; // or replace with clsx if you prefer
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, SmilePlus, SendHorizonal, Send } from 'lucide-react';

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

type FloatingMessengerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Current user ID to align bubbles */
    currentUserId: string;
    /** Messages sorted ASC by sentAt */
    messages: ChatMessage[];
    /** Called when user submits a new message */
    onSend: (payload: { text: string }) => Promise<void> | void;
    /** Optional: uploading state for send button */
    sending?: boolean;
    /** Optional: header title */
    title?: string;
    /** Optional: footer extras renderer */
    footerExtras?: React.ReactNode;
};

export default function FloatingMessenger({
    open,
    onOpenChange,
    currentUserId,
    messages,
    onSend,
    sending = false,
    title = 'Messages',
    footerExtras,
}: FloatingMessengerProps) {
    const [text, setText] = React.useState('');

    async function handleSend() {
        const trimmed = text.trim();
        if (!trimmed) return;
        setText('');
        await onSend({ text: trimmed });
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            void handleSend();
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="p-0 sm:max-w-md">
                <SheetHeader className="px-4 py-3 border-b">
                    <SheetTitle className="text-base">{title}</SheetTitle>
                </SheetHeader>

                <div className="flex h-full flex-col">
                    <ScrollArea className="flex-1 px-3">
                        <div className="space-y-3 py-3">
                            <AnimatePresence initial={false}>
                                {messages.map((m) => {
                                    const mine = m.authorId === currentUserId;
                                    return (
                                        <motion.div
                                            key={m._id}
                                            layout
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.98,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -6,
                                                scale: 0.98,
                                            }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 260,
                                                damping: 20,
                                            }}
                                            className={cn(
                                                'flex w-full gap-2',
                                                mine
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[85%] rounded-2xl px-3 py-2 shadow-sm',
                                                    mine
                                                        ? 'bg-primary text-primary-foreground rounded-br-md'
                                                        : 'bg-muted rounded-bl-md'
                                                )}
                                            >
                                                {m.text && (
                                                    <p className="whitespace-pre-wrap text-sm">
                                                        {m.text}
                                                    </p>
                                                )}

                                                {m.attachments?.length ? (
                                                    <div className="mt-2 space-y-1">
                                                        {m.attachments.map(
                                                            (a, i) => (
                                                                <a
                                                                    key={`${m._id}-att-${i}`}
                                                                    href={a.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className={cn(
                                                                        'block text-xs underline underline-offset-2 break-all',
                                                                        mine
                                                                            ? 'text-primary-foreground/90'
                                                                            : 'text-foreground/80'
                                                                    )}
                                                                >
                                                                    📎{' '}
                                                                    {a.name ||
                                                                        a.url}
                                                                </a>
                                                            )
                                                        )}
                                                    </div>
                                                ) : null}

                                                <span
                                                    className={cn(
                                                        'mt-1 block text-[10px] opacity-70',
                                                        mine
                                                            ? 'text-primary-foreground/80'
                                                            : 'text-foreground/60'
                                                    )}
                                                >
                                                    {new Date(
                                                        m.sentAt
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>

                    <div className="border-t p-3">
                        <div className="flex items-end gap-2">
                            <Button variant="outline" size="icon">
                                <Paperclip />
                            </Button>
                            <Button variant="outline" size="icon">
                                <SmilePlus />
                            </Button>

                            <Textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder="Write a message…  (Ctrl/⌘ + Enter to send)"
                                className="min-h-4 max-h-40 resize-y"
                            />

                            <Button
                                onClick={() => void handleSend()}
                                disabled={!text.trim() || sending}
                            >
                                <Send />
                            </Button>
                        </div>
                        {footerExtras ? (
                            <div className="mt-2">{footerExtras}</div>
                        ) : null}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
