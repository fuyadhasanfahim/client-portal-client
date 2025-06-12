import { useSocket } from '@/app/SocketIOProvider';
import {
    IMessage,
    IMessageWithSender,
    IUserTypingStatus,
} from '@/types/message.interface';
import { useEffect, useState } from 'react';

export const useMessaging = (userId: string) => {
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<IMessageWithSender[]>([]);
    const [typingStatus, setTypingStatus] = useState<
        Record<string, IUserTypingStatus>
    >({});

    const joinConversation = (conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('joinUserRoom', userId);
            socket.emit('joinConversation', conversationId);
        }
    };

    const sendMessage = (messageData: IMessage) => {
        if (socket && isConnected) {
            socket.emit('sendMessage', messageData);
        }
    };

    const setTyping = (data: IUserTypingStatus) => {
        if (socket && isConnected) {
            socket.emit('typing', data);
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: IMessageWithSender) => {
            setMessages((prev) => [...prev, message]);
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        const handleUserTyping = (data: IUserTypingStatus) => {
            setTypingStatus((prev) => ({
                ...prev,
                [data.conversationID]: {
                    ...prev[data.conversationID],
                    [data.userID]: data.isTyping,
                },
            }));
        };

        socket.on('userTyping', handleUserTyping);

        return () => {
            socket.off('userTyping', handleUserTyping);
        };
    }, [socket]);

    return {
        messages,
        setMessages,
        typingStatus,
        joinConversation,
        sendMessage,
        setTyping,
        isConnected,
    };
};
