'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from '@/redux/hooks';
import {
    conversationApi,
    type ConversationListItem,
} from '@/redux/features/conversation/conversationApi';
import { messageApi, type Message } from '@/redux/features/message/messageApi';

export type Mode =
    | { kind: 'admin' }
    | { kind: 'conversation'; conversationID: string };

export function useConversationSocket(socketUrl: string, mode: Mode) {
    const socketRef = useRef<Socket | null>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!socketUrl) return;

        // create (or reuse) the socket
        if (!socketRef.current) {
            socketRef.current = io(socketUrl, {
                withCredentials: true,
                transports: ['websocket'], // avoid polling 404s
                path: '/socket.io', // keep explicit; matches server default
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('socket connect_error:', err.message);
            });
        }

        const s = socketRef.current;

        const joinCurrentRoom = () => {
            if (mode.kind === 'admin') {
                s.emit('join-admin-room');
            } else {
                s.emit('join-conversation', mode.conversationID);
            }
        };

        // re-join on connect/reconnect
        s.on('connect', joinCurrentRoom);

        if (mode.kind === 'admin') {
            const onUpsert = (item: ConversationListItem) => {
                // upsert into the single conversations cache
                try {
                    dispatch(
                        conversationApi.util.updateQueryData(
                            'getConversations',
                            { limit: 50, cursor: null }, // args ignored by serializeQueryArgs
                            (draft) => {
                                const idx = draft.items.findIndex(
                                    (c) => c._id === item._id
                                );
                                if (idx >= 0)
                                    draft.items[idx] = {
                                        ...draft.items[idx],
                                        ...item,
                                    };
                                else draft.items.unshift(item);
                                draft.items.sort(
                                    (a, b) =>
                                        new Date(b.lastMessageAt).getTime() -
                                        new Date(a.lastMessageAt).getTime()
                                );
                            }
                        )
                    );
                } catch {
                    // cache might not exist yet; ignore
                }
            };

            s.on('conversation:upsert', onUpsert);
            // join now if already connected
            joinCurrentRoom();

            return () => {
                s.off('conversation:upsert', onUpsert);
                s.off('connect', joinCurrentRoom);
            };
        }

        if (mode.kind === 'conversation') {
            const room = mode.conversationID;

            const onNew = (m: Message) => {
                // append to this conversation's cache, dedup by _id
                try {
                    dispatch(
                        messageApi.util.updateQueryData(
                            'getMessages',
                            { conversationID: room, limit: 20, cursor: null },
                            (draft) => {
                                if (!draft.items.some((x) => x._id === m._id)) {
                                    draft.items.push(m);
                                }
                            }
                        )
                    );
                } catch {
                    // cache might not exist yet; ignore
                }
            };

            s.on('message:new', onNew);
            // join now if already connected
            joinCurrentRoom();

            return () => {
                s.emit('leave-conversation', room);
                s.off('message:new', onNew);
                s.off('connect', joinCurrentRoom);
            };
        }
    }, [socketUrl, dispatch, mode]);
}
