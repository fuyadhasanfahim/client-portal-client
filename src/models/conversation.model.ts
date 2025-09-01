import { model, models, Schema } from 'mongoose';
import { IConversation, IParticipant } from '../types/conversation.interface';

const participantSchema = new Schema<IParticipant>(
    {
        userID: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        image: String,
        isOnline: { type: Boolean, required: true },
        lastSeenAt: Date,
        role: { type: String, enum: ['user', 'admin'], required: true },
    },
    { _id: false }
);

const conversationSchema = new Schema<IConversation>(
    {
        participants: { type: [participantSchema], required: true },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
        unread: Number,
        lastMessageText: String,
        lastMessageAuthorID: String,
        type: {
            type: String,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ 'participants.userID': 1 });

const ConversationModel =
    models?.Conversation ||
    model<IConversation>('Conversation', conversationSchema);
export default ConversationModel;
