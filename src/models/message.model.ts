import {
    IConversationWithLastMessage,
    IMessage,
} from '@/types/message.interface';
import { Schema, Document, model, models } from 'mongoose';

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
        conversationID: { type: String, required: true },
        senderID: { type: String, required: true },
        content: { type: String, required: true },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'seen'],
            default: 'sent',
        },
        attachments: [AttachmentSchema],
        orderID: { type: String, required: true },
    },
    { timestamps: true }
);

export const MessageModel =
    models?.Message || model<IMessage>('Message', MessageSchema);

const ConversationSchema = new Schema<IConversationWithLastMessage>(
    {
        participants: [{ type: String, required: true }],
        unreadCounts: { type: Map, of: Number, default: {} },
        readBy: [{ type: String }],
    },
    { timestamps: true }
);

export const ConversationModel =
    models?.Conversation ||
    model<IConversationWithLastMessage>('Conversation', ConversationSchema);

export interface IUserTypingStatus extends Document {
    userID: string;
    conversationID: string;
    isTyping: boolean;
}

const UserTypingStatusSchema = new Schema<IUserTypingStatus>({
    userID: { type: String, required: true },
    conversationID: {
        type: String,
        required: true,
    },
    isTyping: { type: Boolean, required: true },
});

export const UserTypingStatusModel =
    models?.UserTypingStatus ||
    model<IUserTypingStatus>('UserTypingStatus', UserTypingStatusSchema);
