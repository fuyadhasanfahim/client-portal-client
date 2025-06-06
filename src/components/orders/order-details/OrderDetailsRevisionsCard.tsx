'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    useGetRevisionsQuery,
    useNewRevisionMutation,
} from '@/redux/features/revisions/revisionsApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    IconLoader,
    IconSend,
    IconMessageCircle2,
    IconClock,
    IconMessage,
    IconX,
    IconSparkles,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ApiError from '@/components/shared/ApiError';
import { IMessages } from '@/types/revision.interface';

export default function FloatingRevisionChat({
    orderID,
    orderStatus,
    user,
}: {
    orderID: string;
    orderStatus: string;
    user: {
        userID: string;
        name: string;
        email: string;
        role: string;
        profileImage: string;
    };
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    // const [isTyping, setIsTyping] = useState(false);

    const { data, isLoading, isError, refetch } = useGetRevisionsQuery(orderID);
    const [newRevision, { isLoading: isRevisionSending }] =
        useNewRevisionMutation();

    useEffect(() => {
        if (orderStatus !== 'In Revision' || user.role !== 'User')
            setIsOpen(false);
    }, [orderStatus, user.role]);

    const handleReply = async () => {
        if (!message.trim()) return toast.error('Message cannot be empty.');
        try {
            const res = await newRevision({
                orderID,
                senderID: user.userID,
                senderName: user.name,
                senderProfileImage: user.profileImage,
                senderRole: user.role,
                message,
            });
            if ('data' in res && res.data.success) {
                setMessage('');
                refetch();
            } else toast.error('Failed to send reply.');
        } catch (err) {
            ApiError(err);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleReply();
        }
    };

    if (orderStatus !== 'In Revision' || user.role !== 'User') return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Action Button */}
            <div className="relative">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative rounded-full w-16 h-16 shadow-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white hover:scale-110 transform transition-all duration-300 ease-out group overflow-hidden"
                >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Sparkle effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <IconSparkles className="absolute top-2 right-2 w-3 h-3 text-white animate-pulse" />
                        <IconSparkles className="absolute bottom-2 left-2 w-2 h-2 text-white animate-pulse delay-100" />
                    </div>

                    <IconMessage
                        size={24}
                        className={`relative z-10 transform transition-transform duration-300 ${
                            isOpen ? 'rotate-12 scale-110' : ''
                        }`}
                    />
                </Button>

                {/* Notification badge */}
                {data?.data?.messages?.length > 0 && !isOpen && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-bounce">
                        {data.data.messages.length}
                    </div>
                )}
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[420px] mt-4 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/95 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 relative">
                    {/* Glassmorphism overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                    <Card className="shadow-none border-0 bg-transparent">
                        {/* Header */}
                        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-5">
                            {/* Animated background particles */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-0 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
                                <div className="absolute top-3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-300" />
                                <div className="absolute bottom-2 left-1/2 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-500" />
                            </div>

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <IconMessageCircle2
                                            size={20}
                                            className="text-white"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            Revision Thread
                                        </h3>
                                        <p className="text-white/70 text-sm">
                                            {data?.data?.messages?.length || 0}{' '}
                                            messages
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
                                >
                                    <IconX size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <CardContent className="p-0 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                            {isLoading ? (
                                <div className="p-8 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 mb-3">
                                        <IconLoader
                                            className="animate-spin text-violet-600"
                                            size={24}
                                        />
                                    </div>
                                    <p className="text-gray-600 font-medium">
                                        Loading messages...
                                    </p>
                                </div>
                            ) : isError ? (
                                <div className="p-8 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                                        <IconX
                                            className="text-red-600"
                                            size={24}
                                        />
                                    </div>
                                    <p className="text-red-600 font-medium">
                                        Failed to load messages
                                    </p>
                                </div>
                            ) : (
                                <div className="p-5 space-y-4">
                                    {data?.data?.messages.map(
                                        (msg: IMessages, index: number) => (
                                            <div
                                                key={index}
                                                className={`group animate-in slide-in-from-bottom-2 duration-300`}
                                                style={{
                                                    animationDelay: `${
                                                        index * 100
                                                    }ms`,
                                                }}
                                            >
                                                <div
                                                    className={`p-4 rounded-2xl shadow-sm border backdrop-blur-sm transition-all duration-200 group-hover:shadow-md ${
                                                        msg.senderRole ===
                                                        'User'
                                                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 ml-8'
                                                            : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 mr-8'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                            <AvatarImage
                                                                src={
                                                                    msg.senderProfileImage
                                                                }
                                                            />
                                                            <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-400 text-white font-semibold">
                                                                {
                                                                    msg
                                                                        .senderName?.[0]
                                                                }
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="text-sm font-bold text-gray-800">
                                                                    {
                                                                        msg.senderName
                                                                    }
                                                                </div>
                                                                <div
                                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                        msg.senderRole ===
                                                                        'User'
                                                                            ? 'bg-blue-100 text-blue-700'
                                                                            : 'bg-emerald-100 text-emerald-700'
                                                                    }`}
                                                                >
                                                                    {
                                                                        msg.senderRole
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                                                                <IconClock
                                                                    size={12}
                                                                />
                                                                {msg.createdAt &&
                                                                    format(
                                                                        new Date(
                                                                            msg.createdAt
                                                                        ),
                                                                        'MMM d, h:mm a'
                                                                    )}
                                                            </div>
                                                            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                                                {msg.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </CardContent>

                        {/* Input Area */}
                        <div className="border-t border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm p-5">
                            <div className="relative">
                                <Textarea
                                    placeholder="Type your message... (Press Enter to send)"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="pr-14 resize-none rounded-xl border-2 border-gray-200/50 shadow-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder:text-gray-400"
                                    rows={2}
                                />
                                <div className="absolute bottom-2 right-2">
                                    <Button
                                        size="sm"
                                        onClick={handleReply}
                                        disabled={
                                            isRevisionSending || !message.trim()
                                        }
                                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg px-4 py-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isRevisionSending ? (
                                            <IconLoader
                                                className="animate-spin"
                                                size={16}
                                            />
                                        ) : (
                                            <IconSend size={16} />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
