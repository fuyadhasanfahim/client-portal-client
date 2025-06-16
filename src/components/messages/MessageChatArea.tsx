import { IConversation, IMessage } from '@/types/message.interface';
import { Skeleton } from '../ui/skeleton';
import ChatArea from './ChatArea';

interface MessageChatAreaProps {
    isLoading: boolean;
    isError: boolean;
    messages: IMessage[];
    selectedConversation: IConversation;
    messageText: string;
    setMessageText: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: () => void;
    handleKeyPress: (e: React.KeyboardEvent) => void;
    typingStatus: Record<string, boolean>;
    disable?: boolean;
}

export default function MessageChatArea({
    isLoading,
    isError,
    messages,
    selectedConversation,
    messageText,
    setMessageText,
    handleSendMessage,
    handleKeyPress,
    typingStatus,
    disable,
}: MessageChatAreaProps) {
    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                {Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-red-500 text-center py-6">
                Failed to load chat messages. Please try again later.
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="text-gray-500 text-center py-6">
                No messages yet. Start the conversation!
            </div>
        );
    }

    return (
        <ChatArea
            selectedConversation={selectedConversation}
            messages={messages}
            messageText={messageText}
            setMessageText={setMessageText}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            typingStatus={typingStatus}
            disable={disable}
        />
    );
}
