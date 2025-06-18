import { IConversation } from '@/types/message.interface';
import ConversationItem from './ConversationItem';

interface Props {
    conversations: IConversation[];
    selectedConversationID: string | null;
    setSelectedConversationID: (id: string) => void;
}

export default function MessageConversations({
    conversations,
    selectedConversationID,
    setSelectedConversationID,
}: Props) {
    return (
        <div className="space-y-2">
            {conversations.map((c) => (
                <ConversationItem
                    key={c._id}
                    conversation={c}
                    isSelected={selectedConversationID === c._id}
                    onClick={() => setSelectedConversationID(c._id!)}
                />
            ))}
        </div>
    );
}
