'use client';

import { useEffect, useRef, useState } from 'react';
import ChatArea from './ChatArea';
import { IMessage } from '@/types/message.interface';
import { socket } from '@/lib/socket';
import toast from 'react-hot-toast';
import ApiError from '../shared/ApiError';
import { useSession } from 'next-auth/react';
import { useSetMessageMutation } from '@/redux/features/messages/messagesApi';

export default function MessageChatArea({
    conversationID,
}: {
    conversationID: string;
}) {
    const { data: session } = useSession();
    const { name, email, id, image, role } = session?.user || {};

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<IMessage[]>([]);

    const [setMessage, { isLoading }] = useSetMessageMutation();

    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversationID) return;

            try {
                const response = await fetch(
                    `/api/messages/get-messages?conversation_id=${conversationID}`
                );
                const result = await response.json();

                if (result.success) {
                    setMessages(result.data);
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                ApiError(error);
            }
        };

        fetchMessages();
    }, [conversationID, setMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
    }, [messages]);

    useEffect(() => {
        const handleNewMessage = (data: IMessage) => {
            setMessages((prev) => [...prev, data]);
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, []);

    const handleSendMessage = async () => {
        if (messageText.trim() === '') {
            return;
        }

        const newMessage = {
            conversationID,
            sender: {
                userID: id!,
                name: name ?? '',
                email: email ?? '',
                profileImage: image ?? '',
                role: role ?? '',
                isOnline: true,
            },
            content: messageText,
        };

        try {
            const response = await setMessage(newMessage).unwrap();

            socket.emit('sendMessage', newMessage);

            const patchedMessage: IMessage = {
                ...newMessage,
                _id: response.data._id,
                sender: response.data.sender,
                status: 'sent',
            };

            socket.emit('sendMessage', patchedMessage);
            setMessageText('');
        } catch (error) {
            ApiError(error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <ChatArea
            messages={messages}
            messageText={messageText}
            setMessageText={setMessageText}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            inputRef={inputRef}
            isLoading={isLoading}
        />
    );
}
