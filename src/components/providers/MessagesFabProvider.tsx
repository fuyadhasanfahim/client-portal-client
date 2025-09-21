'use client';

import React, { useState } from 'react';
import FloatingMessenger from '@/components/shared/FloatingMessages/FloatingMessenger';
import FloatingMessageButton from '@/components/shared/FloatingMessages/FloatingMessageButton';
import useLoggedInUser from '@/utils/getLoggedInUser';

export default function MessagesFabProvider() {
    const { user } = useLoggedInUser();

    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    if (!user || user.role !== 'user') {
        return null;
    }

    console.log(unreadCount)

    return (
        <>
            <FloatingMessenger open={open} onOpenChange={setOpen} user={user} setUnreadCount={setUnreadCount} />

            <FloatingMessageButton
                isOpen={open}
                onToggle={() => setOpen((v) => !v)}
                unreadCount={unreadCount}
            />
        </>
    );
}
