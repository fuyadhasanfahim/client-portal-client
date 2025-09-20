'use client';

import React, { useState } from 'react';
import FloatingMessenger from '@/components/shared/FloatingMessages/FloatingMessenger';
import FloatingMessageButton from '@/components/shared/FloatingMessages/FloatingMessageButton';
import useLoggedInUser from '@/utils/getLoggedInUser';

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
