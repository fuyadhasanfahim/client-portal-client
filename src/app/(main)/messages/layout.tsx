'use client';

import MessageConversations from '@/components/messages/MessageConversations';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useGetAllConversationsQuery } from '@/redux/features/messages/messagesApi';

export default function MessageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [selectedConversationID, setSelectedConversationID] = useState<
        string | null
    >(null);

    useEffect(() => {
        if (selectedConversationID) {
            router.push(`/messages/${selectedConversationID}`);
        }
    }, [router, selectedConversationID]);

    const { data, isLoading } = useGetAllConversationsQuery([]);

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
                                conversations={data?.data || []}
                                selectedConversationID={selectedConversationID}
                                setSelectedConversationID={
                                    setSelectedConversationID
                                }
                                isLoading={isLoading}
                            />
                        </div>
                    </ScrollArea>
                </div>

                <div className="col-span-8">{children}</div>
            </div>
        </Card>
    );
}
