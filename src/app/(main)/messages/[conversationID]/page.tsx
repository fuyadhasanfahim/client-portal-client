'use client';

import MessageChatArea from '@/components/messages/MessageChatArea';
import { useParams } from 'next/navigation';

export default function ConversationPage() {
    const { conversationID } = useParams() as { conversationID: string };

    return <MessageChatArea conversationID={conversationID} />;
}
