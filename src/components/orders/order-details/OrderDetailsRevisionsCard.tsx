'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
    useGetRevisionsQuery,
    useNewRevisionMutation,
} from '@/redux/features/revisions/revisionsApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    IconLoader,
    IconSend,
    IconMessageCircle2,
    IconClock,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { useState } from 'react';
import ApiError from '@/components/shared/ApiError';
import toast from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function OrderDetailsRevisionsCard({
    orderID,
    user,
}: {
    orderID: string;
    user: {
        userID: string;
        name: string;
        email: string;
        role: string;
        profileImage: string;
    };
}) {
    const { data, isLoading, isError, refetch } = useGetRevisionsQuery(orderID);
    const [newRevision, { isLoading: isRevisionSending }] =
        useNewRevisionMutation();
    const [message, setMessage] = useState('');

    console.log(user);

    const handleReply = async () => {
        if (!message.trim()) return toast.error('Message cannot be empty.');

        try {
            if (user) {
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
                } else {
                    toast.error('Failed to send reply.');
                }
            }
        } catch (err) {
            ApiError(err);
        }
    };

    console.log(isError);

    let content;

    if (isLoading) {
        content = (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-slate-100">
                <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                            <IconLoader
                                size={32}
                                className="animate-spin text-blue-600"
                            />
                            <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-pulse"></div>
                        </div>
                        <p className="text-slate-600 font-medium">
                            Loading revision thread...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    } else if (isError) {
        content = (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
                <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                            <span className="text-red-600 text-xl">⚠</span>
                        </div>
                        <div className="text-center">
                            <h3 className="font-semibold text-red-800 mb-1">
                                Something went wrong!
                            </h3>
                            <p className="text-red-600 text-sm">
                                Please try again later.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    } else {
        const revision = data.data;

        content = (
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <IconMessageCircle2
                                size={20}
                                className="text-white"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                Revision Thread
                            </h3>
                            <p className="text-blue-100 text-sm">
                                {revision.messages.length}{' '}
                                {revision.messages.length === 1
                                    ? 'message'
                                    : 'messages'}
                            </p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-0">
                    <div className="max-h-[45vh] overflow-y-auto">
                        <div className="p-6 space-y-4">
                            {revision.messages.map(
                                (
                                    msg: {
                                        senderID: string;
                                        senderName: string;
                                        senderProfileImage: string;
                                        senderRole: string;
                                        message: string;
                                        createdAt: Date;
                                    },
                                    index: number
                                ) => (
                                    <div
                                        key={index}
                                        className={`transform transition-all duration-300 hover:scale-[1.01] ${
                                            msg.senderRole === 'User'
                                                ? 'ml-8'
                                                : 'mr-8'
                                        }`}
                                    >
                                        <Card
                                            className={`shadow-md border-0 overflow-hidden transition-all duration-300 hover:shadow-lg ${
                                                msg.senderRole === 'User'
                                                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-l-blue-500'
                                                    : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-l-emerald-500'
                                            }`}
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start gap-4">
                                                    <div className="relative group">
                                                        <Avatar className="ring-2 ring-white shadow-md transition-transform duration-200 group-hover:scale-110">
                                                            <AvatarImage
                                                                src={
                                                                    msg.senderProfileImage
                                                                }
                                                                alt={
                                                                    msg.senderName
                                                                }
                                                            />
                                                            <AvatarFallback
                                                                className={`font-semibold text-white ${
                                                                    msg.senderRole ===
                                                                    'User'
                                                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                                                        : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                                                }`}
                                                            >
                                                                {msg.senderName?.[0]?.toUpperCase() ||
                                                                    '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div
                                                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                                                msg.senderRole ===
                                                                'User'
                                                                    ? 'bg-blue-500'
                                                                    : 'bg-emerald-500'
                                                            }`}
                                                        ></div>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className="font-semibold text-slate-800">
                                                                {msg.senderName}
                                                            </span>
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    msg.senderRole ===
                                                                    'User'
                                                                        ? 'bg-blue-200 text-blue-800'
                                                                        : 'bg-emerald-200 text-emerald-800'
                                                                }`}
                                                            >
                                                                {msg.senderRole}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center space-x-1 text-xs text-slate-500 mb-3">
                                                            <IconClock
                                                                size={12}
                                                            />
                                                            <span>
                                                                {format(
                                                                    new Date(
                                                                        msg.createdAt
                                                                    ),
                                                                    'PPpp'
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                                                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                                                {msg.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-t border-slate-200">
                        <div className="space-y-4">
                            <div className="relative">
                                <Textarea
                                    placeholder="Type your reply here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="resize-none bg-white border-2 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm min-h-[100px] pr-16"
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                                    {message.length}/1000
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-xs text-slate-500">
                                    Press Ctrl + Enter to send quickly
                                </div>
                                <Button
                                    onClick={handleReply}
                                    disabled={
                                        isRevisionSending || !message.trim()
                                    }
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRevisionSending ? (
                                        <div className="flex items-center space-x-2">
                                            <IconLoader
                                                size={16}
                                                className="animate-spin"
                                            />
                                            <span>Sending...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <IconSend size={16} />
                                            <span>Send Reply</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return content;
}
