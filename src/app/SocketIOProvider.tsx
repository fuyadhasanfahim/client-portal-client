'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type SocketContextType = {
    socket: Socket | null;
    isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export default function SocketIOProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
            path: '/api/socketio',
            transports: ['websocket'],
            autoConnect: false,
        });

        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to Socket.io server');
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from Socket.io server');
        });

        socketInstance.connect();

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}
