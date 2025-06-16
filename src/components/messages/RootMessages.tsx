'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    useGetAllConversationsQuery,
    useGetMessagesQuery,
    useSetMessageMutation,
} from '@/redux/features/messages/messagesApi';
import { useSession } from 'next-auth/react';
import MessageConversations from './MessageConversations';
import { useRef, useState, useEffect } from 'react';
import { IConversation, IMessage, IUserTypingStatus } from '@/types/message.interface';
import MessageChatArea from './MessageChatArea';
import ApiError from '../shared/ApiError';
import { useSocket } from '@/app/SocketIOProvider';

export default function RootMessages() {
    const { data: session } = useSession();
    const [selectedConversation, setSelectedConversation] =
        useState<IConversation | null>(null);
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [typingStatus, setTypingStatus] = useState<{
        [key: string]: boolean;
    }>({});
    const inputRef = useRef<HTMLInputElement>(null);
    const { socket } = useSocket();

    const {
        data: conversationsData,
        isLoading: isConversationLoading,
        isError: isConversationError,
    } = useGetAllConversationsQuery(session?.user.role ?? '', {
        skip: !session,
    });

    const {
        data: messagesData,
        isLoading: isMessagesLoading,
        isError: isMessageError,
    } = useGetMessagesQuery(
        {
            conversationID: selectedConversation?._id,
            userID: session?.user?.id,
        },
        {
            skip: !selectedConversation?._id || !session?.user?.id,
        }
    );

    const [setMessage, { isLoading, isError }] = useSetMessageMutation();

    useEffect(() => {
        if (messagesData?.data) {
            setMessages(messagesData.data);
        }
    }, [messagesData]);

    useEffect(() => {
        if (!socket || !selectedConversation?._id) return;

        socket.emit('joinConversation', selectedConversation._id);

        socket.on('receiveMessage', (message: IMessage) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('typing', (userId: string, isTyping: boolean) => {
            setTypingStatus((prev) => ({
                ...prev,
                [userId]: isTyping,
            }));
        });

        return () => {
            socket.off('receiveMessage');
            socket.off('typing');
            socket.emit('leaveConversation', selectedConversation._id);
        };
    }, [socket, selectedConversation]);

    useEffect(() => {
        if (!socket || !selectedConversation?._id) return;

        const convId = selectedConversation._id;

        socket.emit('joinConversation', convId);

        const handleReceiveMessage = (message: IMessage) => {
            if (message.conversationID === convId) {
                setMessages((prev) => [...prev, message]);
            }
        };

        const handleTyping = (data: IUserTypingStatus) => {
            if (data.conversationID === convId) {
                setTypingStatus((prev) => ({
                    ...prev,
                    [data.userID]: data.isTyping,
                }));
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('userTyping', handleTyping);

        return () => {
            socket.emit('leaveConversation', convId);
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('userTyping', handleTyping);
        };
    }, [socket, selectedConversation?._id]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConversation || !session?.user?.id)
            return;

        const sender = {
            userID: session.user.id,
            name: session.user.name || '',
            email: session.user.email || '',
            profileImage: session.user.image || '',
            isOnline: true,
        };

        const newMessage: IMessage = {
            _id: '',
            conversationID: selectedConversation._id!,
            sender,
            content: messageText,
            createdAt: new Date().toISOString(),
            status: 'sent',
        };

        try {
            const response = await setMessage(newMessage).unwrap();
            const sentMessage: IMessage = {
                ...newMessage,
                _id: response.data._id,
                status: 'sent',
            };

            socket?.emit('sendMessage', selectedConversation._id, sentMessage);

            setMessages((prev) => [...prev, sentMessage]);
            setMessageText('');
            inputRef.current?.focus();
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
        <Card className="h-[calc(100vh-96px)] overflow-hidden py-0 w-full">
            <div className="grid grid-cols-12 h-full">
                <div className="col-span-4 border-r border-border bg-muted/20">
                    <CardHeader className="p-4 py-[23px]">
                        <CardTitle className="text-2xl">Messages</CardTitle>
                    </CardHeader>
                    <Separator />
                    <ScrollArea className="h-[calc(100vh-200px)]">
                        <div className="p-2">
                            <MessageConversations
                                conversations={conversationsData?.data}
                                isLoading={isConversationLoading}
                                isError={isConversationError}
                                selectedConversation={selectedConversation}
                                setSelectedConversation={
                                    setSelectedConversation
                                }
                            />
                        </div>
                    </ScrollArea>
                </div>

                {selectedConversation ? (
                    <MessageChatArea
                        handleKeyPress={handleKeyPress}
                        handleSendMessage={handleSendMessage}
                        isError={isMessageError}
                        isLoading={isMessagesLoading}
                        messageText={messageText}
                        messages={messages}
                        selectedConversation={selectedConversation}
                        setMessageText={setMessageText}
                        typingStatus={typingStatus}
                        disable={isLoading || isError}
                    />
                ) : (
                    <div className="col-span-8 flex items-center justify-center">
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
