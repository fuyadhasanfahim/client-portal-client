'use client';

import React, { useEffect, useState } from 'react';
import FloatingMessenger from '@/components/shared/FloatingMessages/FloatingMessenger';
import FloatingMessageButton from '@/components/shared/FloatingMessages/FloatingMessageButton';
import { useGetMessagesQuery } from '@/redux/features/message/messageApi';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { IMessage } from '@/types/message.interface';

export default function MessagesFabProvider() {
    const { user } = useLoggedInUser();

    const [open, setOpen] = useState(true);

    if (!user || user.role !== 'user') {
        return null;
    }

    return (
        <>
            <FloatingMessenger
                open={open}
                onOpenChange={setOpen}
                user={user}
            />

            <FloatingMessageButton
                isOpen={open}
                onToggle={() => setOpen((v) => !v)}
                unreadCount={0}
            />
        </>
    );
}
