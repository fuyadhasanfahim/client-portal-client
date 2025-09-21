import { Document } from 'mongoose';

export interface IAttachment {
    url: string;
    name: string;
    size: number; // bytes
    contentType?: string;
}

export interface IMessage extends Document {
    _id: string;
    conversationID: string;
    authorID?: string;
    authorRole?: 'user' | 'admin';
    text?: string;
    kind: 'user' | 'system';
    systemType?: 'join' | 'leave' | 'info';
    sentAt: Date;
    attachment?: IAttachment | null;
    createdAt: Date;
    updatedAt: Date;
}
