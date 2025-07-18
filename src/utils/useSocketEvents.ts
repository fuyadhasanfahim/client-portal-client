'use client';

import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import useLoggedInUser from './getLoggedInUser';

export function useSocketEvents() {
    const { user } = useLoggedInUser();

    useEffect(() => {
        if (!user.userID) return;

        socket.connect();
        socket.emit('join-room', user.userID);

        return () => {
            socket.disconnect();
        };
    }, [user]);
}
