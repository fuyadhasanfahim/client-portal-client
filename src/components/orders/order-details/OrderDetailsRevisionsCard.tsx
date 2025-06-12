// ✅ CLEANED & FIXED CLIENT COMPONENT: OrderDetailsRevisionsCard

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
import { IMessageWithSender } from '@/types/message.interface';
import { nanoid } from 'nanoid';

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
    const [messages, setMessages] = useState<IMessageWithSender[]>([]);
    const [messageText, setMessageText] = useState('');
    const { data: session } = useSession();
    const { socket, isConnected } = useSocket();

    console.log(messages);

    const {
        data: userData,
        isLoading: isUserLoading,
        isError: isUserError,
    } = useGetUsersWithRoleQuery('SuperAdmin');

    const adminUser = isUserLoading ? (
        <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
            </div>
        </div>
    ) : isUserError || !userData?.data?.length ? (
        <h3>Something went wrong!</h3>
    ) : (
        <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
                <AvatarImage
                    src={userData.data[0].profileImage}
                    alt={userData.data[0].name}
                />
                <AvatarFallback>
                    {userData.data[0].name?.[0] || 'U'}
                </AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-base">
                    {userData.data[0].name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    {userData.data[0].email}
                </p>
            </div>
        </div>
    );

    useEffect(() => {
        const fetchMessages = async () => {
            const res = await fetch(
                `/api/messages/get-messages?orderID=${orderID}`
            );
            const data = await res.json();
            setMessages(data.data);
        };
        fetchMessages();
    }, [orderID]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('newMessage', (msg: IMessageWithSender) => {
            if (msg.orderID === orderID) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        return () => {
            socket.off('newMessage');
        };
    }, [socket, isConnected, orderID]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !session?.user?.id) return;

        const newMessage = {
            conversationID: nanoid(10),
            senderID: session.user.id,
            orderID,
            content: messageText,
            status: 'sent',
        };

        try {
            const res = await fetch('/api/messages/set-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMessage),
            });

            const json = await res.json();
            const sentMessage = json.data;

            const patchedMessage = {
                ...sentMessage,
                sender: {
                    userID: session.user.id,
                    name: session.user.name || '',
                    email: session.user.email || '',
                    profileImage: session.user.image || '',
                },
            };

            socket?.emit('sendMessage', patchedMessage);
            setMessages((prev) => [...prev, patchedMessage]);
            setMessageText('');
        } catch (error) {
            console.error('Message send failed:', error);
        }
    };

    return (
        user.role === 'User' &&
        orderStatus === 'In Revision' && (
            <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm">
                {isOpen ? (
                    <Card className="gap-0 w-full max-w-md shadow">
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
                                messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            'rounded-lg px-4 py-2 max-w-[80%]',
                                            msg.sender.userID ===
                                                session?.user?.id
                                                ? 'bg-accent text-accent-foreground ml-auto border-r-0'
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
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
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
