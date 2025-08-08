'use client';

import { socket } from '@/lib/socket';
import { socketEvents } from '@/utils/socket/socketEvents';
import { useEffect } from 'react';

type Entity = 'order' | 'quote';
type EntityEvent = keyof typeof socketEvents.entity;

export function useSocketRoom({
    entity,
    entityID,
    event,
    onEvent,
}: {
    entity: Entity;
    entityID: string;
    event: EntityEvent;
    onEvent: (data: any) => void;
}) {
    useEffect(() => {
        if (!entityID) return;

        const joinEvent = socketEvents.joinRoom(entity);
        const leaveEvent = socketEvents.leaveRoom(entity);
        const eventName = socketEvents.entity[event](entity);

        socket.emit(joinEvent, entityID);
        socket.on(eventName, onEvent);

        return () => {
            socket.off(eventName, onEvent);
            socket.emit(leaveEvent, entityID);
        };
    }, [entityID, event, onEvent, entity]);
}
