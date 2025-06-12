'use client';

import { useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IconMessage, IconSend, IconX } from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useGetUsersWithRoleQuery } from '@/redux/features/users/userApi';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/app/SocketIOProvider';
import {
    IConversationWithLastMessage,
    IMessageWithSender,
} from '@/types/message.interface';

interface IOrderDetailsRevisionCardProps {
    orderID: string;
    user: {
        userID: string;
        name: string;
        email: string;
        role: string;
        profileImage: string;
    };
    orderStatus: string;
}

export default function OrderDetailsRevisionsCard({
    orderID,
    user,
    orderStatus,
}: IOrderDetailsRevisionCardProps) {
    const [isOpen, setIsOpen] = useState(true);

    const {
        data: userData,
        isLoading: isUserLoading,
        isError: isUserError,
    } = useGetUsersWithRoleQuery('SuperAdmin');

    let adminUser;

    if (isUserLoading && !isUserError && !userData) {
        adminUser = (
            <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </div>
            </div>
        );
    }

    if (isUserError && !isUserLoading && !userData) {
        adminUser = <h3>Something went wrong!</h3>;
    }

    if (
        userData?.data &&
        Array.isArray(userData.data) &&
        userData.data.length > 0 &&
        !isUserLoading &&
        !isUserError
    ) {
        const firstUser = userData.data[0];
        adminUser = (
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                    <AvatarImage
                        src={firstUser.profileImage}
                        alt={`${firstUser.name}'s Profile image.`}
                    />
                    <AvatarFallback>
                        {firstUser.name?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base">
                        {firstUser.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {firstUser.email}
                    </p>
                </div>
            </div>
        );
    }

    const { data: session } = useSession();
    const { socket, isConnected } = useSocket();
    const [conversations, setConversations] = useState<
        IConversationWithLastMessage[]
    >([]);
    const [selectedConversation, setSelectedConversation] =
        useState<IConversationWithLastMessage | null>(null);
    const [messages, setMessages] = useState<IMessageWithSender[]>([]);
    const [messageText, setMessageText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>(
        {}
    );

    // Fetch conversations on component mount
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/messages/conversations');
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
    }, []);

    // Fetch messages when conversation is selected
    useEffect(() => {
        if (!selectedConversation) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(
                    `/api/messages/get-conversations?conversationId=${selectedConversation._id}`
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
                        name: session.user.name || '',
                        email: session.user.email || '',
                        profileImage: session.user.image || '',
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

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        user.role === 'User' &&
        orderStatus === 'In Progress' && (
            <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm">
                {isOpen ? (
                    <Card className="gap-0 w-full max-w-md">
                        <CardHeader className="flex items-center justify-between gap-3 pb-6">
                            {adminUser}
                            <Button
                                size="icon"
                                variant="outline"
                                className="text-muted-foreground rounded-full"
                                onClick={() => setIsOpen(false)}
                            >
                                <IconX size={18} />
                            </Button>
                        </CardHeader>
                        <Separator />
                        <CardContent className="space-y-3 h-[400px] overflow-y-auto py-2">
                            {messages.length > 0 ? (
                                messages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        className={cn(
                                            'rounded-lg px-4 py-2 max-w-[80%]',
                                            msg.sender.userID ===
                                                session?.user?.id
                                                ? 'bg-accent text-accent-foreground ml-auto'
                                                : 'bg-primary text-white'
                                        )}
                                    >
                                        <p>{msg.content}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p>No messages found!</p>
                                </div>
                            )}
                        </CardContent>
                        <Separator />
                        <CardFooter className="pt-6">
                            <div className="flex w-full items-center gap-2">
                                <Textarea
                                    value={messageText}
                                    onChange={(e) =>
                                        setMessageText(e.target.value)
                                    }
                                    placeholder="Type your message..."
                                    onKeyDown={handleKeyPress}
                                />
                                <Button
                                    size="icon"
                                    className="rounded-full"
                                    onClick={handleSendMessage}
                                    disabled={!messageText.trim()}
                                >
                                    <IconSend size={18} />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ) : (
                    <div className="relative flex justify-end">
                        <Button
                            className="rounded-full w-12 h-12 hover:scale-105"
                            onClick={() => setIsOpen(true)}
                        >
                            <IconMessage />
                        </Button>
                    </div>
                )}
            </div>
        )
    );
}
