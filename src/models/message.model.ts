import { IMessage } from '@/types/message.interface';
import { Schema, Document, Types, model, models } from 'mongoose';

const AttachmentSchema = new Schema(
    {
        type: { type: String, enum: ['image', 'file'], required: true },
        url: { type: String, required: true },
        name: { type: String },
    },
    { _id: false, timestamps: true }
);

const MessageSchema = new Schema<IMessage>(
    {
        conversationID: { type: String, ref: 'Conversation', required: true },
        senderID: { type: String, ref: 'User', required: true },
        content: { type: String, required: true },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'seen'],
            default: 'sent',
        },
        attachments: [AttachmentSchema],
    },
    { timestamps: true }
);

export const MessageModel =
    models?.Message || model<IMessage>('Message', MessageSchema);

export interface IConversation extends Document {
    participants: (Types.ObjectId | string)[];
    unreadCounts: { [userID: string]: number };
    readBy: (Types.ObjectId | string)[];
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
    {
        participants: [
            { type: Schema.Types.ObjectId, ref: 'User', required: true },
        ],
        unreadCounts: { type: Map, of: Number, default: {} },
        readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
     { timestamps: true }
);

export const ConversationModel =
    models?.Conversation ||
    model<IConversation>('Conversation', ConversationSchema);

export interface IUserTypingStatus extends Document {
    userID: Types.ObjectId | string;
    conversationID: Types.ObjectId | string;
    isTyping: boolean;
}

const UserTypingStatusSchema = new Schema<IUserTypingStatus>({
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversationID: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    isTyping: { type: Boolean, required: true },
});

export const UserTypingStatusModel =
    models?.UserTypingStatus ||
    model<IUserTypingStatus>('UserTypingStatus', UserTypingStatusSchema);
