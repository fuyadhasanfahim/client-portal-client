export interface IMessageUser {
    userID: string;
    name: string;
    email: string;
    profileImage: string;
    isOnline: boolean;
}

export interface IMessage {
    _id?: string;
    conversationID: string;
    senderID: string;
    content: string;
    status?: 'sent' | 'delivered' | 'seen';
    createdAt: Date;
    updatedAt?: Date;
    attachments?: {
        type: 'image' | 'file';
        url: string;
        name?: string;
    }[];
}

export interface IMessageWithSender extends Omit<IMessage, 'senderID'> {
    sender: IMessageUser;
}

export interface IConversation {
    _id?: string;
    participants: string[];
    unreadCounts: {
        [userID: string]: number;
    };
    readBy: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IConversationWithLastMessage extends IConversation {
    lastMessage?: IMessageWithSender;
    participantsInfo: IMessageUser[];
}

export interface IUserTypingStatus {
    userID: string;
    conversationID: string;
    isTyping: boolean;
}
