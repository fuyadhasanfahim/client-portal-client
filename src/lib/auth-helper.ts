import ConversationModel from '@/models/conversation.model';
import UserModel from '@/models/user.model';
import dbConfig from './dbConfig';

type LeanUser = {
    userID: string;
    name?: string;
    username?: string;
    email: string;
    image?: string;
    role?: string;
};

export async function ensureSupportConversation(userID: string) {
    await dbConfig();

    const userDoc = await UserModel.findOne({ userID }).lean<LeanUser | null>();
    const adminDocs = await UserModel.find({ role: 'admin' }).lean<
        LeanUser[]
    >();

    if (!userDoc) return;
    if (!adminDocs || adminDocs.length === 0) return;

    const userParticipant = {
        userID: userDoc.userID,
        name: userDoc.name ?? userDoc.username ?? 'User',
        email: userDoc.email,
        image: userDoc.image ?? undefined,
        isOnline: false,
        lastSeenAt: undefined,
        role: userDoc.role ?? 'user',
        unreadCount: 0,
        lastReadMessageID: null,
    };

    const adminParticipants = adminDocs.map((a) => ({
        userID: a.userID,
        name: a.name ?? a.username ?? 'Admin',
        email: a.email,
        image: a.image ?? undefined,
        isOnline: false,
        lastSeenAt: undefined,
        role: a.role ?? 'admin',
        unreadCount: 0,
        lastReadMessageID: null,
    }));

    await ConversationModel.findOneAndUpdate(
        { type: 'support', 'participants.userID': userID },
        {
            $setOnInsert: {
                participants: [userParticipant, ...adminParticipants],
                type: 'support',
                lastMessageAt: new Date(),
                lastMessageText: '',
                lastMessageAuthorID: null,
                activeAdminID: null,
                activeClientID: userDoc.userID,
                lock: false,
            },
        },
        { upsert: true, new: true }
    );
}
