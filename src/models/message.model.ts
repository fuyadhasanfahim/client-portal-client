import { Schema, model, models } from 'mongoose';
import {
    IMessage,
    IMessageUser,
    IConversation,
    IUserTypingStatus,
} from '@/types/message.interface';

// User message model
const AttachmentSchema = new Schema(
    {
        type: { type: String, enum: ['image', 'file'], required: true },
        url: { type: String, required: true },
        name: { type: String },
    },
    { _id: false }
);

const MessageUserSchema = new Schema<IMessageUser>(
    {
        userID: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        profileImage: { type: String, required: true },
        role: { type: String },
        isOnline: { type: Boolean, default: false },
    },
    { _id: false }
);

const MessageSchema = new Schema<IMessage>(
    {
        conversationID: { type: String, required: true },
        sender: { type: MessageUserSchema, required: true },
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

// User conversation model
const ConversationSchema = new Schema<IConversation>(
    {
        participants: [{ type: String, required: true }],
        unreadCounts: {
            type: Map,
            of: Number,
            default: {},
        },
        readBy: [{ type: String }],
        lastMessage: { type: MessageSchema },
        participantsInfo: [{ type: MessageUserSchema, required: true }],
        assignedTo: String,
        status: {
            type: String,
            enum: ['open', 'in-progress', 'resolved', 'closed'],
            default: 'open',
        },
    },
    { timestamps: true }
);

export const ConversationModel =
    models?.Conversation ||
    model<IConversation>('Conversation', ConversationSchema);

// User typing model
const UserTypingStatusSchema = new Schema<IUserTypingStatus>(
    {
        userID: { type: String, required: true },
        conversationID: { type: String, required: true },
        isTyping: { type: Boolean, required: true },
    },
    { timestamps: true }
);

export const UserTypingStatusModel =
    models?.UserTypingStatus ||
    model<IUserTypingStatus>('UserTypingStatus', UserTypingStatusSchema);
