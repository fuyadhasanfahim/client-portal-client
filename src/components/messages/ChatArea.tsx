import { IconSend } from '@tabler/icons-react';
import { Button } from '../ui/button';
import { CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import ChatHeader from './ChatHeader';
import ChatBubble from './ChatBubble';
import { useSession } from 'next-auth/react';
import { IConversation, IMessage } from '@/types/message.interface';

interface ChatAreaProps {
    selectedConversation: IConversation;
    messages: IMessage[];
    messageText: string;
    setMessageText: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: () => void;
    handleKeyPress: (e: React.KeyboardEvent) => void;
    typingStatus: Record<string, boolean>;
    disable?: boolean;
}

export default function ChatArea({
    selectedConversation,
    messages,
    messageText,
    setMessageText,
    handleSendMessage,
    handleKeyPress,
    typingStatus,
    disable,
}: ChatAreaProps) {
    const { data: session } = useSession();
    const otherParticipant = selectedConversation.participantsInfo[0];

    return (
        <CardContent className="col-span-8 flex flex-col h-full px-0">
            <ChatHeader user={otherParticipant} />
            <Separator />
            <ScrollArea className="flex-1 px-4 bg-background max-h-[calc(100vh-300px)]">
                <div className="space-y-4 py-2">
                    {messages?.map((msg) => (
                        <ChatBubble
                            key={msg._id}
                            message={msg}
                            isOwn={msg.sender.userID === session?.user?.id}
                        />
                    ))}
                </div>
            </ScrollArea>
            <Separator />
            <div className="p-4 bg-muted/40 border-t">
                {Object.values(typingStatus).some((status) => status) && (
                    <div className="text-sm text-muted-foreground mb-2">
                        {otherParticipant.name} is typing...
                    </div>
                )}
                <div className="flex items-end gap-2">
                    <Textarea
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || disable}
                        size="icon"
                        className="rounded-full"
                    >
                        <IconSend size={20} />
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
