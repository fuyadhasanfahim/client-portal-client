import { IConversation } from '@/types/message.interface';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ConversationItem({
    conversation,
    isSelected,
    onClick,
}: {
    conversation: IConversation;
    isSelected: boolean;
    onClick: () => void;
}) {
    const otherParticipant = conversation.participantsInfo[0];
    const unreadCount = conversation.unreadCounts[otherParticipant.userID] || 0;

    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                isSelected ? 'bg-muted' : 'hover:bg-muted/50'
            )}
        >
            <div className="relative shrink-0">
                <Avatar className="h-12 w-12 ring-1 ring-ring/20">
                    <AvatarImage
                        src={otherParticipant.profileImage}
                        alt={otherParticipant.name}
                    />
                    <AvatarFallback>
                        {getInitials(otherParticipant.name)}
                    </AvatarFallback>
                </Avatar>
                {otherParticipant.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-md" />
                )}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-sm font-semibold truncate">
                        {otherParticipant.name}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {conversation.lastMessage &&
                        conversation.lastMessage.createdAt
                            ? formatDistanceToNow(
                                  conversation.lastMessage.createdAt,
                                  { addSuffix: true }
                              )
                            : 'No messages'}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                    {conversation.lastMessage?.content ||
                        'Start a conversation'}
                </p>
                <div className="flex justify-between mt-1">
                    <p className="text-[11px] text-muted-foreground truncate">
                        {otherParticipant.email}
                    </p>
                    {unreadCount > 0 && (
                        <Badge
                            variant="default"
                            className="text-[10px] h-5 px-2 bg-primary text-white"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('');
}
