export type IParticipant = {
    userID: string;
    name: string;
    email: string;
    image?: string;
    isOnline: boolean;
    lastSeenAt?: Date;
    role: 'admin' | 'user';
};

export type IConversation = {
    _id: string;
    participants: IParticipant[];
    lastMessageAt: Date;
    unread?: number;
    lastMessageText?: string;
    lastMessageAuthorID?: string;
    type?: string;
    createdAt?: Date;
    updatedAt?: Date;
};
