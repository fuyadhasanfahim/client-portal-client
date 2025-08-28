/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo } from 'react';
import { io as clientIO, Socket } from 'socket.io-client';
import { useAppDispatch } from '@/redux/hooks'; // ✅ typed dispatch
import { messageApi } from '@/redux/features/message/messageApi';
import { conversationApi } from '@/redux/features/conversation/conversationApi';

export function useConversationSocket(baseUrl: string, currentUserID: string) {
    const dispatch = useAppDispatch(); // ✅ can dispatch thunks now

    const socket: Socket = useMemo(
        () =>
            clientIO(baseUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling'],
            }),
        [baseUrl]
    );

    const safeUpdate = (fn: () => void) => {
        try {
            fn();
        } catch {}
    };

    useEffect(() => {
        if (currentUserID) socket.emit('join-user-room', currentUserID);

        const onNew = (msg: any) => {
            safeUpdate(() =>
                dispatch(
                    messageApi.util.updateQueryData(
                        'getMessages',
                        {
                            conversationID: msg.conversationID,
                            limit: 20,
                            cursor: null,
                        },
                        (draft) => {
                            const seen = new Set(
                                draft.items?.map((m: any) => m._id)
                            );
                            if (!seen.has(msg._id))
                                draft.items = [...(draft.items ?? []), msg];
                        }
                    )
                )
            );

            safeUpdate(() =>
                dispatch(
                    conversationApi.util.updateQueryData(
                        'getConversations',
                        { userID: currentUserID, limit: 20, cursor: null },
                        (draft) => {
                            const idx = draft.items.findIndex(
                                (c: any) => c._id === msg.conversationID
                            );
                            if (idx >= 0) {
                                const item = draft.items[idx];
                                item.lastMessageAt = msg.sentAt;
                                item.lastMessageAuthorId = msg.authorId;
                                item.lastMessageText =
                                    msg.text ??
                                    (msg.attachments?.length
                                        ? '[attachment]'
                                        : '');
                                draft.items.splice(idx, 1);
                                draft.items.unshift(item);
                            }
                        }
                    )
                )
            );
        };

        const onRead = (payload: {
            userID: string;
            upToMessageId: string;
            conversationID: string;
        }) => {
            safeUpdate(() =>
                dispatch(
                    messageApi.util.updateQueryData(
                        'getMessages',
                        {
                            conversationID: payload.conversationID,
                            limit: 20,
                            cursor: null,
                        },
                        (draft) => {
                            const now = new Date().toISOString();
                            for (const m of draft.items) {
                                if (
                                    m._id.localeCompare(
                                        payload.upToMessageId
                                    ) <= 0
                                ) {
                                    m.readBy = m.readBy || {};
                                    if (!m.readBy[payload.userID])
                                        m.readBy[payload.userID] = now;
                                }
                            }
                        }
                    )
                )
            );
        };

        socket.on('message:new', onNew);
        socket.on('message:read', onRead);

        return () => {
            socket.off('message:new', onNew);
            socket.off('message:read', onRead);
            socket.disconnect();
        };
    }, [socket, dispatch, currentUserID]);

    return {
        socket,
        joinConversation: (conversationID: string) =>
            socket.emit('join-conversation', conversationID),
        leaveConversation: (conversationID: string) =>
            socket.emit('leave-conversation', conversationID),
    };
}
