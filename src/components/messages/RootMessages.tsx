'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ConversationItem from './ConversationItem';
import ChatArea from './ChatArea';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/app/SocketIOProvider';
import { IConversationWithLastMessage, IMessageWithSender } from '@/types/message.interface';

export default function RootMessages() {
    const { data: session } = useSession();
    const { socket, isConnected } = useSocket();
    const [conversations, setConversations] = useState<
        IConversationWithLastMessage[]
    >([]);
    const [selectedConversation, setSelectedConversation] =
        useState<IConversationWithLastMessage | null>(null);
    const [messages, setMessages] = useState<IMessageWithSender[]>([]);
    const [messageText, setMessageText] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>(
        {}
    );

    // Fetch conversations on component mount
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/conversations');
                const data = await res.json();
                setConversations(data);
                if (data.length > 0 && !selectedConversation) {
                    setSelectedConversation(data[0]);
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, [selectedConversation]);

    useEffect(() => {
        if (!selectedConversation) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(
                    `/api/messages?conversationId=${selectedConversation._id}`
                );
                const data = await res.json();
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        // Join conversation room
        if (socket && isConnected) {
            socket.emit('joinConversation', selectedConversation._id);
        }
    }, [selectedConversation, socket, isConnected]);

    // Socket.io event listeners
    useEffect(() => {
        if (!socket || !selectedConversation) return;

        const handleNewMessage = (message: IMessageWithSender) => {
            if (message.conversationID === selectedConversation._id) {
                setMessages((prev) => [...prev, message]);
            }
            // Update last message in conversations list
            setConversations((prev) =>
                prev.map((conv) =>
                    conv._id === message.conversationID
                        ? { ...conv, lastMessage: message }
                        : conv
                )
            );
        };

        const handleUserTyping = (data: {
            userId: string;
            isTyping: boolean;
        }) => {
            if (data.userId !== session?.user?.id) {
                setTypingStatus((prev) => ({
                    ...prev,
                    [data.userId]: data.isTyping,
                }));
            }
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('userTyping', handleUserTyping);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('userTyping', handleUserTyping);
        };
    }, [socket, selectedConversation, session]);

    const filteredConversations = conversations.filter((conv) =>
        conv.participantsInfo.some(
            (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConversation || !session?.user?.id)
            return;

        const newMessage = {
            conversationID: selectedConversation._id,
            senderID: session.user.id,
            content: messageText,
            status: 'sent',
        };

        try {
            // Optimistically add message to UI
            const tempId = Date.now().toString();
            setMessages((prev) => [
                ...prev,
                {
                    ...newMessage,
                    _id: tempId,
                    createdAt: new Date(),
                    sender: {
                        userID: session.user.id,
                        name: session.user.name ?? '',
                        email: session.user.email ?? '',
                        profileImage: session.user.image ?? '',
                        isOnline: true,
                    },
                } as IMessageWithSender,
            ]);

            // Emit message via socket
            socket?.emit('sendMessage', newMessage);
            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = (isTyping: boolean) => {
        if (!selectedConversation || !session?.user?.id) return;
        socket?.emit('typing', {
            userId: session.user.id,
            conversationId: selectedConversation._id,
            isTyping,
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        } else {
            handleTyping(true);
        }
    };

    if (isLoading) {
        return <div>Loading conversations...</div>;
    }

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
                            {filteredConversations.map((conv) => (
                                <ConversationItem
                                    key={conv._id}
                                    conversation={conv}
                                    isSelected={
                                        selectedConversation?._id === conv._id
                                    }
                                    onClick={() =>
                                        setSelectedConversation(conv)
                                    }
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                {selectedConversation ? (
                    <ChatArea
                        selectedConversation={selectedConversation}
                        messages={messages}
                        messageText={messageText}
                        setMessageText={setMessageText}
                        handleSendMessage={handleSendMessage}
                        handleKeyPress={handleKeyPress}
                        typingStatus={typingStatus}
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
