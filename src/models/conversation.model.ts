import { model, models, Schema } from 'mongoose';
import { IConversation, IParticipant } from '@/types/conversation.interface.js';

const participantSchema = new Schema<IParticipant>(
    {
        userID: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: false,
        },
        isOnline: {
            type: Boolean,
            required: true,
        },
        lastSeenAt: {
            type: Date,
            required: false,
        },
        role: {
            type: String,
            required: false,
        },
    },
    {
        _id: false,
    }
);

const conversationSchema = new Schema<IConversation>(
    {
        participants: {
            type: [participantSchema],
            required: true,
        },
        lastMessageAt: {
            type: Date,
            required: true,
        },
        unread: {
            type: Number,
            required: false,
        },
        lastMessageText: {
            type: String,
            required: false,
        },
        lastMessageAuthorId: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const ConversationModel =
    models?.Conversation ||
    model<IConversation>('Conversation', conversationSchema);
export default ConversationModel;
