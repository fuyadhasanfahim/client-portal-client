'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, SmilePlus, Send } from 'lucide-react';

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
    currentUserId: string;
    messages: ChatMessage[];
    onSend: (payload: { text: string }) => Promise<void> | void;
    sending?: boolean;
    title?: string;
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
    const bottomRef = React.useRef<HTMLDivElement>(null);

    async function handleSend() {
        const trimmed = text.trim();
        if (!trimmed) return;
        setText('');
        await onSend({ text: trimmed });
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            void handleSend();
        }
    }

    // auto-scroll to bottom on new messages
    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: 'end' });
    }, [messages.length]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {/* Make the content a flex column and prevent outer overflow */}
            <SheetContent
                side="right"
                className="sm:max-w-md p-0 flex h-full flex-col overflow-hidden"
            >
                <SheetHeader className="px-4 py-3 border-b shrink-0">
                    <SheetTitle className="text-base">{title}</SheetTitle>
                </SheetHeader>

                {/* Middle scroller MUST have flex-1 min-h-0 */}
                <ScrollArea className="flex-1 min-h-0 px-3">
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
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
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

                                            {!!m.attachments?.length && (
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
                                            )}

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

                        {/* anchor to keep view pinned to bottom */}
                        <div ref={bottomRef} />
                    </div>
                </ScrollArea>

                {/* Footer should never disappear; keep it shrink-0 */}
                <div className="border-t p-3 shrink-0 bg-white">
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
                            className="min-h-[36px] max-h-40 resize-y"
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
            </SheetContent>
        </Sheet>
    );
}
