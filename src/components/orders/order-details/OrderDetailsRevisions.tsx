'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { IRevision, IRevisionMessage } from '@/types/revision.interface';
import { formatDistanceToNow } from 'date-fns';

type Props = {
    revision: IRevision;
    className?: string;
};

const timeAgo = (d?: Date | string) => {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d;
    return formatDistanceToNow(date, { addSuffix: true });
};

const StatusPill = ({ s }: { s: IRevision['status'] }) => (
    <span
        className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            s === 'open' && 'bg-emerald-50 text-emerald-700',
            s === 'in-review' && 'bg-amber-50 text-amber-700',
            s === 'closed' && 'bg-gray-100 text-gray-700'
        )}
    >
        {s}
    </span>
);

const Message = ({ m }: { m: IRevisionMessage }) => (
    <div className="rounded-xl border p-3">
        <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{m.senderName}</span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] uppercase tracking-wide">
                {m.senderRole}
            </span>
            <span>•</span>
            <span>{timeAgo(m.createdAt)}</span>
        </div>
        <p className="text-sm leading-6">{m.message}</p>
    </div>
);

export default function OrderDetailsRevisions({ revision, className }: Props) {
    const messages = revision?.messages ?? [];

    if (!revision || messages.length === 0) {
        return (
            <section
                className={cn('rounded-2xl border bg-white p-5', className)}
            >
                <h3 className="mb-2 text-base font-semibold">Revisions</h3>
                <p className="text-sm text-muted-foreground">
                    No revision messages yet.
                </p>
            </section>
        );
    }

    return (
        <section className={cn('rounded-2xl border bg-white', className)}>
            <div className="flex items-center justify-between border-b p-5">
                <h3 className="text-base font-semibold">
                    Revisions{' '}
                    <span className="text-muted-foreground">
                        ({messages.length})
                    </span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusPill s={revision.status} />
                    <span>•</span>
                    <span>
                        updated{' '}
                        {timeAgo(
                            revision.lastMessageAt ||
                                revision.updatedAt ||
                                revision.createdAt
                        )}
                    </span>
                </div>
            </div>

            <ul className="divide-y">
                {messages.map((m, i) => (
                    <li key={`${revision.orderID}-${i}`} className="p-5">
                        <Message m={m} />
                    </li>
                ))}
            </ul>
        </section>
    );
}
