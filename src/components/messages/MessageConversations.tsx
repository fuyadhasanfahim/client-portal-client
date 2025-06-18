import { IConversation } from '@/types/message.interface';
import ConversationItem from './ConversationItem';
import { Skeleton } from '../ui/skeleton';

interface Props {
    conversations: IConversation[];
    selectedConversationID: string | null;
    setSelectedConversationID: (id: string) => void;
    isLoading: boolean;
}

export default function MessageConversations({
    conversations,
    selectedConversationID,
    setSelectedConversationID,
    isLoading,
}: Props) {
    if (isLoading) {
        return (
            <div className="space-y-3 p-4">
                {[...Array(10)].map((_, index) => (
                    <Skeleton key={index} className="h-22 w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2 p-4 overflow-y-auto max-h-[calc(100vh-180px)]">
            {conversations.length === 0 ? (
                <div className="text-muted-foreground text-sm text-center py-6">
                    No conversations found.
                </div>
            ) : (
                conversations.map((conversation) => (
                    <ConversationItem
                        key={conversation._id}
                        conversation={conversation}
                        isSelected={selectedConversationID === conversation._id}
                        onClick={() =>
                            setSelectedConversationID(conversation._id!)
                        }
                    />
                ))
            )}
        </div>
    );
}
