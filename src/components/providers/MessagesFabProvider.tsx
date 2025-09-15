'use client';

import * as React from 'react';
import FloatingMessenger from '@/components/shared/FloatingMessages/FloatingMessenger';
import FloatingMessageButton from '@/components/shared/FloatingMessages/FloatingMessageButton';
import { useGetMessagesQuery } from '@/redux/features/message/messageApi';
import useLoggedInUser from '@/utils/getLoggedInUser';
import TestMessage from '../message';
import { socket } from '@/lib/socket';
import { useUpdateUserMutation } from '@/redux/features/users/userApi';
import { IMessage } from '@/types/message.interface';

export default function MessagesFabProvider() {
    const { user } = useLoggedInUser();
    const { conversationID, userID } = user;

    const [open, setOpen] = React.useState(false);
    const [cursor, setCursor] = React.useState<string | null>(null);

    const { data, isFetching, refetch } = useGetMessagesQuery(
        {
            userID: userID,
            conversationID: conversationID,
            rawLimit: 50,
            cursor: cursor ?? undefined,
        },
        {
            skip: !user || !conversationID,
        }
    );

    const messages: IMessage[] = data?.data?.messages ?? [];
    const nextCursor = data?.data?.nextCursor ?? null;

    const [updateUser] = useUpdateUserMutation();

    // Socket connection and real-time handling
    React.useEffect(() => {
        if (!conversationID || !userID) return;

        console.log(
            'MessagesFabProvider: Setting up socket for conversation',
            conversationID
        );

        // Join conversation room when component mounts
        socket.emit('conversation:join', {
            conversationID,
            userID,
        });

        // Handle new messages
        const handleNewMessage = (message: IMessage) => {
            console.log('MessagesFabProvider: New message received', message);
            // Refetch messages to get the latest data
            refetch();
        };

        socket.on('new-message', handleNewMessage);

        // Cleanup on unmount
        return () => {
            socket.off('new-message', handleNewMessage);
            socket.emit('conversation:leave', {
                conversationID,
                userID,
            });
            updateUser({
                userID: userID,
                data: {
                    isOnline: false,
                },
            });
        };
    }, [conversationID, userID, refetch, updateUser]);

    const unreadCount = 0;
    const isTestDone = true;

    const topRef = React.useRef<HTMLDivElement>(null);

    // Intersection observer for pagination
    React.useEffect(() => {
        if (!topRef.current || !nextCursor || isFetching) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    console.log(
                        'Loading more messages with cursor:',
                        nextCursor
                    );
                    setCursor(nextCursor);
                }
            },
            { threshold: 1 }
        );

        observer.observe(topRef.current);

        return () => {
            observer.disconnect();
        };
    }, [nextCursor, isFetching]);

    // Handle messages refetch for FloatingMessenger
    const handleMessagesRefetch = React.useCallback(() => {
        console.log('Refetching messages...');
        refetch();
    }, [refetch]);

    if (!user || user.role !== 'user') {
        return null;
    }

    return (
        <>
            {!isTestDone ? (
                <TestMessage open={open} onOpenChange={setOpen} />
            ) : (
                <FloatingMessenger
                    open={open}
                    onOpenChange={setOpen}
                    messages={messages}
                    sending={isFetching}
                    userID={userID}
                    conversationID={conversationID!}
                    title="Support"
                    onMessagesRefetch={handleMessagesRefetch}
                />
            )}

            <FloatingMessageButton
                isOpen={open}
                onToggle={() => setOpen((v) => !v)}
                unreadCount={unreadCount}
            />
        </>
    );
}
