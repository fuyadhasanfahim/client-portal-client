export interface IMessageUser {
    userID: string;
    name: string;
    email: string;
    profileImage: string;
    isOnline?: boolean;
}

export interface IMessage {
    _id?: string;
    conversationID: string;
    sender: IMessageUser;
    content: string;
    status?: 'sent' | 'delivered' | 'seen';
    createdAt: Date;
    attachments?: {
        type: 'image' | 'file';
        url: string;
        name?: string;
    }[];
}

export interface IConversation {
    _id?: string;
    participants: string[];
    unreadCounts: {
        [userID: string]: number;
    };
    readBy: string[];
    lastMessage?: IMessage;
    participantsInfo: IMessageUser[];
    createdAt: Date;
}

export interface IUserTypingStatus {
    userID: string;
    conversationID: string;
    isTyping: boolean;
}
