'use client';

import { IconLoader, IconSend } from '@tabler/icons-react';
import { Button } from '../ui/button';
import { CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import ChatHeader from './ChatHeader';
import ChatBubble from './ChatBubble';
import { useSession } from 'next-auth/react';
import {
    IConversation,
    IMessage,
    IMessageUser,
} from '@/types/message.interface';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ApiError from '../shared/ApiError';

interface ChatAreaProps {
    messages: IMessage[];
    messageText: string;
    setMessageText: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: () => void;
    handleKeyPress: (e: React.KeyboardEvent) => void;
    inputRef: React.RefObject<HTMLTextAreaElement | null>;
    isLoading: boolean;
    disable?: boolean;
}

export default function ChatArea({
    messages,
    messageText,
    setMessageText,
    handleSendMessage,
    handleKeyPress,
    inputRef,
    isLoading,
    disable,
}: ChatAreaProps) {
    const { data: session } = useSession();
    const [isConversationLoading, setIsConversationLoading] =
        useState<boolean>(false);
    const [conversation, setConversation] = useState<IConversation | null>(
        null
    );

    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchConversation = async () => {
            try {
                setIsConversationLoading(true);

                const response = await fetch(
                    `/api/messages/get-conversation?user_id=${session.user.id}`
                );
                const result = await response.json();

                if (result.success) {
                    setConversation(result.data);
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                ApiError(error);
            } finally {
                setIsConversationLoading(false);
            }
        };

        fetchConversation();
    }, [session?.user?.id]);

    const user = useMemo(
        () =>
            conversation?.participantsInfo.find(
                (p) => p.userID !== session?.user?.id
            ),
        [conversation, session?.user?.id]
    );

    return (
        <CardContent className="col-span-8 flex flex-col h-full px-0">
            <ChatHeader
                user={user as IMessageUser}
                isConversationLoading={isConversationLoading}
            />
            <Separator />
            <ScrollArea className="flex-1 px-4 bg-background max-h-[calc(100vh-300px)]">
                <div className="space-y-4 py-2">
                    {messages?.map((msg, index) => (
                        <ChatBubble
                            key={index}
                            message={msg}
                            isOwn={msg.sender.userID === session?.user?.id}
                        />
                    ))}
                </div>
            </ScrollArea>
            <Separator />
            <div className="p-4 bg-muted/40 border-t">
                <div className="flex items-end gap-2">
                    <Textarea
                        ref={inputRef}
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || disable || isLoading}
                        size="icon"
                        className="rounded-full"
                    >
                        {isLoading ? (
                            <IconLoader size={20} className="animate-spin" />
                        ) : (
                            <IconSend size={20} />
                        )}
                    </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 ml-1">
                    Press <strong>Enter</strong> to send,{' '}
                    <strong>Shift + Enter</strong> for new line
                </p>
            </div>
        </CardContent>
    );
}
