export type IParticipant = {
    userID: string;
    name: string;
    email: string;
    image?: string;
    isOnline: boolean;
    lastSeenAt?: Date;
    role?: "admin" | "support" | "user";
};

export type IConversation = {
    _id: string;
    participants: IParticipant[];
    lastMessageAt: Date;
    unread?: number;
    lastMessageText?: string;
    lastMessageAuthorId?: string;
    type?: "dm" | "group" | "support";
    createdAt?: Date;
    updatedAt?: Date;
};
