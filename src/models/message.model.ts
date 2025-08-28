import { Schema, model, models } from 'mongoose';
import { IAttachment, IMessage, IReaction } from '@/types/message.interface.js';

const attachmentSchema = new Schema<IAttachment>(
    {
        url: { type: String, required: true },
        mimeType: { type: String, required: true },
        name: String,
        sizeBytes: Number,
        width: Number,
        height: Number,
        durationSec: Number,
        thumbnailUrl: String,
        uploadedAt: { type: Date, required: true },
    },
    { _id: false }
);

const reactionSchema = new Schema<IReaction>(
    {
        emoji: { type: String, required: true },
        userId: { type: String, required: true, index: true },
    },
    { _id: false }
);

const messageSchema = new Schema<IMessage>(
    {
        conversationID: { type: String, required: true, index: true },
        authorId: { type: String, required: true, index: true },
        text: String,
        sentAt: { type: Date, default: Date.now, index: true },
        status: {
            type: String,
            enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
            default: 'sending',
            index: true,
        },
        attachments: [attachmentSchema],
        replyToId: String,
        editedAt: Date,
        deletedAt: Date,
        reactions: [reactionSchema],
        readBy: {
            type: Map,
            of: Date,
            default: undefined,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

messageSchema.index({ conversationID: 1, _id: -1 });

const MessageModel =
    models?.Message || model<IMessage>('Message', messageSchema);
export default MessageModel;
