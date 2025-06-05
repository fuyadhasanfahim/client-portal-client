'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
    useGetRevisionsQuery,
    useNewRevisionMutation,
} from '@/redux/features/revisions/revisionsApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IconLoader } from '@tabler/icons-react';
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

    console.log(data);

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
            } else {
                toast.error('Failed to send reply.');
            }
        } catch (err) {
            ApiError(err);
        }
    };

    console.log(isError);

    let content;

    if (isLoading) {
        content = (
            <Card>
                <CardContent className="p-6 flex justify-center items-center">
                    <IconLoader size={24} className="animate-spin" />
                </CardContent>
            </Card>
        );
    } else if (isError) {
        content = (
            <Card className="border border-destructive text-destructive">
                <CardContent className="p-6">
                    Something went wrong! Try again later.
                </CardContent>
            </Card>
        );
    } else {
        const revision = data.data;

        content = (
            <Card>
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">Revision Thread</h3>

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
                            <Card
                                key={index}
                                className={`${
                                    msg.senderRole === 'User'
                                        ? 'bg-blue-50'
                                        : 'bg-green-50'
                                }`}
                            >
                                <CardContent className="p-4 flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage
                                            src={msg.senderProfileImage}
                                            alt={msg.senderName}
                                        />
                                        <AvatarFallback>
                                            {msg.senderName?.[0]?.toUpperCase() ||
                                                '?'}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            <strong>{msg.senderName}</strong> (
                                            {format(
                                                new Date(msg.createdAt),
                                                'PPpp'
                                            )}
                                            )
                                        </div>
                                        <div className="text-sm text-gray-800 whitespace-pre-line">
                                            {msg.message}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    )}

                    <div className="space-y-2 pt-4">
                        <Textarea
                            placeholder="Type your reply here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button
                            onClick={handleReply}
                            disabled={isRevisionSending}
                        >
                            Send Reply
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return content;
}
