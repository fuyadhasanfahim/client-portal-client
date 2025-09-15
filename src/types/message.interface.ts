export interface IMessage {
    _id: string;
    conversationID: string;
    authorID: string;
    authorRole: 'user' | 'admin';
    text: string;
    sentAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
