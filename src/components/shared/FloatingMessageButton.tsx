'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    MessageCircle,
    Send,
    X,
    Paperclip,
    Smile,
    Check,
    CheckCheck,
    Clock,
    Minimize2,
    Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { IMessage } from '@/types/message.interface';
import { useSession } from 'next-auth/react';
import ApiError from './ApiError';
import { useGetAdminQuery } from '@/redux/features/users/userApi';
import { socket } from '@/lib/socket';
import {
    useSetMessageMutation,
    useGetMessagesQuery,
    useGetConversationQuery,
} from '@/redux/features/messages/messagesApi';
import { nanoid } from 'nanoid';

// Helper functions
const getStatusIcon = (status: string) => {
    const iconProps = 'w-3 h-3';
    switch (status) {
        case 'sent':
            return (
                <Clock className={`${iconProps} text-muted-foreground/50`} />
            );
        case 'delivered':
            return (
                <Check className={`${iconProps} text-muted-foreground/50`} />
            );
        case 'seen':
            return <CheckCheck className={`${iconProps} text-primary`} />;
        default:
            return null;
    }
};

const FloatingChatUI = () => {
    // State management
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const isTyping = false;
    const [optimisticMessages, setOptimisticMessages] = useState<IMessage[]>(
        []
    );

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Session and user data
    const { data: session } = useSession();
    const { name, email, id, image, role } = session?.user || {};
    const { data: adminData } = useGetAdminQuery({});
    const admin = adminData?.data;

    // RTK Query hooks
    const { data: conversationData } = useGetConversationQuery(id as string, {
        skip: !id,
    });
    const conversation = conversationData?.data;

    const {
        data: messagesData,
        isLoading: loadingMessages,
        isFetching: fetchingMessages,
    } = useGetMessagesQuery(
        {
            conversationID: conversation?._id as string,
            userID: id as string,
        },
        {
            skip: !conversation?._id || !id,
            // Reduced polling interval for better UX
            pollingInterval: 10000,
        }
    );

    const [setMessage, { isLoading: sending }] = useSetMessageMutation();

    // Combine server messages with optimistic updates
    const messages = [
        ...(messagesData?.data || []),
        ...optimisticMessages.filter(
            (optMsg) =>
                !messagesData?.data?.some(
                    (msg: IMessage) => msg._id === optMsg._id
                )
        ),
    ].sort(
        (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Effects
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus();
        }
    }, [isOpen, isMinimized]);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        const handleNewMessage = (data: IMessage) => {
            if (data.conversationID === conversation?._id) {
                // Remove optimistic message if it exists
                setOptimisticMessages((prev) =>
                    prev.filter((msg) => msg._id !== data._id)
                );
            }
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [conversation?._id]);

    // Event handlers
    const handleSendMessage = async () => {
        const trimmed = messageText.trim();
        if (!trimmed || !id) return;

        const baseMessage = {
            sender: {
                userID: id,
                name: name ?? '',
                email: email ?? '',
                profileImage: image ?? '',
                role: role ?? '',
                isOnline: true,
            },
            content: trimmed,
        };

        const tempId = nanoid(10);
        const optimisticMessage: IMessage = {
            ...baseMessage,
            _id: tempId,
            createdAt: new Date().toString(),
            status: 'sent',
        };

        // Add optimistic message immediately
        setOptimisticMessages((prev) => [...prev, optimisticMessage]);
        setMessageText('');

        try {
            const response = await setMessage(baseMessage).unwrap();

            const confirmedMessage = {
                ...optimisticMessage,
                _id: response.data._id,
                status: 'delivered',
            };

            // Update optimistic message with real ID
            setOptimisticMessages((prev) =>
                prev.map((msg) =>
                    msg._id === tempId
                        ? {
                              ...msg,
                              _id: response.data._id,
                              status: 'delivered',
                          }
                        : msg
                )
            );

            socket.emit('sendMessage', confirmedMessage);
        } catch (error) {
            // Remove optimistic message if send fails
            setOptimisticMessages((prev) =>
                prev.filter((msg) => msg._id !== tempId)
            );
            ApiError(error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    // UI rendering
    const renderMessage = (msg: IMessage, index: number) => (
        <div
            key={msg._id || index}
            className={cn(
                'flex',
                msg.sender.userID === id ? 'justify-end' : 'justify-start'
            )}
        >
            <div
                className={`flex items-end space-x-2 max-w-[85%] ${
                    msg.sender.userID === id
                        ? 'flex-row-reverse space-x-reverse'
                        : ''
                }`}
            >
                {msg.sender.userID !== id && (
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={admin?.profileImage} />
                        <AvatarFallback className="text-xs bg-gray-100">
                            {admin?.name
                                ?.split(' ')
                                .map((n: string) => n[0])
                                .join('')}
                        </AvatarFallback>
                    </Avatar>
                )}
                <div
                    className={`rounded-2xl px-4 py-2 shadow-sm ${
                        msg.sender.userID === id
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary text-primary-foreground'
                    }`}
                >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div
                        className={`flex items-center justify-between mt-1 ${
                            msg.sender.userID === id
                                ? 'text-muted-foreground/70'
                                : 'text-primary-foreground/70'
                        }`}
                    >
                        <span className="text-xs">
                            {msg.createdAt &&
                                format(new Date(msg.createdAt), 'p')}
                        </span>
                        {msg.sender.userID === id && (
                            <div className="ml-2">
                                {getStatusIcon(msg.status || 'sent')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTypingIndicator = () => (
        <div className="flex justify-start">
            <div className="flex items-end space-x-2">
                <Avatar className="w-6 h-6 mb-1">
                    <AvatarImage src={admin?.profileImage} />
                    <AvatarFallback className="text-xs bg-muted">
                        {admin?.name
                            ?.split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                    </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                        <div
                            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <TooltipProvider>
            <div className="fixed bottom-6 right-6 z-50">
                {/* Chat Window */}
                {isOpen && (
                    <div
                        className={cn(
                            'bg-card rounded-2xl w-full shadow-2xl border mb-4 transition-all duration-300 max-w-sm',
                            isMinimized ? 'h-16' : 'h-[600px]'
                        )}
                    >
                        <div
                            className={cn(
                                'flex items-center justify-between p-4 border-b bg-primary text-primary-foreground',
                                isMinimized ? ' rounded-2xl' : ' rounded-t-2xl'
                            )}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage
                                            src={admin?.profileImage}
                                        />
                                        <AvatarFallback>
                                            {admin?.name
                                                ?.split(' ')
                                                .map((n: string) => n[0])
                                                .join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-primary-foreground rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate">
                                        {admin?.name || 'Support'}
                                    </h3>
                                    <p className="text-xs text-primary-foreground/80">
                                        {isTyping ? 'Typing...' : 'Online'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-primary-foreground hover:bg-white"
                                            onClick={toggleMinimize}
                                        >
                                            {isMinimized ? (
                                                <Maximize2 className="w-4 h-4" />
                                            ) : (
                                                <Minimize2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {isMinimized ? 'Maximize' : 'Minimize'}
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-primary-foreground hover:bg-white"
                                            onClick={toggleChat}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Close</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                <ScrollArea className="flex-1 px-4 h-[440px]">
                                    <div className="space-y-4 py-2">
                                        {loadingMessages || fetchingMessages ? (
                                            <div className="h-full flex items-center justify-center">
                                                <p className="text-sm leading-relaxed">
                                                    Loading messages...
                                                </p>
                                            </div>
                                        ) : (
                                            messages.map(renderMessage)
                                        )}
                                        {isTyping && renderTypingIndicator()}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>

                                {/* Input Area */}
                                <div className="p-4 border-t bg-background rounded-b-2xl">
                                    <div className="flex items-end space-x-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                ref={inputRef}
                                                value={messageText}
                                                onChange={(e) =>
                                                    setMessageText(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyPress={handleKeyPress}
                                                placeholder="Type your message..."
                                                className="pr-20 resize-none focus:border-primary focus:ring-primary rounded-xl"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Paperclip className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Attach file
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Smile className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Add emoji
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={
                                                !messageText.trim() || sending
                                            }
                                            className="h-10 w-10 p-0 rounded-xl"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Floating Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={toggleChat}
                            className="relative h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
                        >
                            <MessageCircle className="w-6 h-6" />
                            {unreadCount > 0 && !isOpen && (
                                <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs border-2 border-background animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        Chat with Support
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};

export default FloatingChatUI;
