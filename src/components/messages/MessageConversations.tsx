import { IConversation } from '@/types/message.interface';
import ConversationItem from './ConversationItem';
import { Skeleton } from '../ui/skeleton';

interface MessageConversationsProps {
    conversations: IConversation[];
    isLoading: boolean;
    isError: boolean;
    selectedConversation: IConversation | null;
    setSelectedConversation: (conversation: IConversation | null) => void;
}

export default function MessageConversations({
    conversations,
    isLoading,
    isError,
    selectedConversation,
    setSelectedConversation,
}: MessageConversationsProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} className="h-22 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-destructive text-center py-4">
                Error fetching conversations.
            </div>
        );
    }

    if (conversations?.length === 0) {
        return (
            <div className="text-gray-500 text-center py-4">
                No messages found. Wait for a user to start a conversation.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {conversations?.map((conversation) => (
                <ConversationItem
                    key={conversation._id}
                    conversation={conversation}
                    isSelected={selectedConversation?._id === conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                />
            ))}
        </div>
    );
}
