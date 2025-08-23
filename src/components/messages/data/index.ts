export type Participant = {
    userID: string;
    name: string;
    email: string;
    image?: string;
    isOnline: boolean;
};

export type Conversation = {
    _id: string;
    participants: Participant[];
    lastMessageAt: Date;
    unread?: number;
};

export type IAttachment = {
    _id: string;
    attachment: string;
    attachmentType: string;
    attachmentAt: Date;
};

export type ChatMessage = {
    _id: string;
    conversationID: string;
    authorId: string;
    text: string;
    sentAt: Date;
};

export const me: Participant = {
    userID: 'me',
    name: 'Fuyad Hasan Fahim',
    email: 'fuyad@gmail.com',
    image: '',
    isOnline: true,
};

export const people: Participant[] = [
    {
        userID: 'admin',
        name: 'Admin',
        email: 'admin@webbriks.com',
        image: '',
        isOnline: true,
    },
    {
        userID: 'sam',
        name: 'Samir',
        email: 'samir@webbriks.com',
        image: '',
        isOnline: true,
    },
    {
        userID: 'lina',
        name: 'Lina',
        email: 'lina@webbriks.com',
        image: '',
        isOnline: true,
    },
];

export const conversationsSeed: Conversation[] = [
    {
        _id: 'c01',
        participants: [people[0], me],
        lastMessageAt: new Date(Date.now() - 5 * 60_000),
        unread: 2,
    },
    {
        _id: 'c02',
        participants: [people[1], me],
        lastMessageAt: new Date(Date.now() - 2 * 60 * 60_000),
    },
    {
        _id: 'c03',
        participants: [people[2], me],
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60_000),
        unread: 1,
    },
    {
        _id: 'c04',
        participants: [people[2], me],
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60_000),
        unread: 1,
    },
    {
        _id: 'c05',
        participants: [people[2], me],
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60_000),
        unread: 1,
    },
    {
        _id: 'c06',
        participants: [people[2], me],
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60_000),
        unread: 1,
    },
    {
        _id: 'c07',
        participants: [people[2], me],
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60_000),
        unread: 1,
    },
    {
        _id: 'c08',
        participants: [people[2], me],
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60_000),
        unread: 1,
    },
    {
        _id: 'c09',
        participants: [people[2], me],
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60_000),
        unread: 1,
    },
    {
        _id: 'c010',
        participants: [people[2], me],
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60_000),
        unread: 1,
    },
    {
        _id: 'c011',
        participants: [people[2], me],
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60_000),
        unread: 1,
    },
];

export const messagesSeed: ChatMessage[] = [
    // Admin
    {
        _id: 'm1',
        conversationID: 'c01',
        authorId: 'admin',
        text: 'Hi Fuyad 👋 Can you share today’s progress?',
        sentAt: new Date(Date.now() - 35 * 60_000),
    },
    {
        _id: 'm2',
        conversationID: 'c01',
        authorId: 'me',
        text: 'Hey! Wrapped the UI polish for the message screen ✅',
        sentAt: new Date(Date.now() - 30 * 60_000),
    },
    {
        _id: 'm3',
        conversationID: 'c01',
        authorId: 'admin',
        text: 'Nice! Push it to Git and drop the link here.',
        sentAt: new Date(Date.now() - 5 * 60_000),
    },

    // Samir
    {
        _id: 'm4',
        conversationID: 'c02',
        authorId: 'sam',
        text: 'Need a small change in the navbar hover.',
        sentAt: new Date(Date.now() - 2 * 60 * 60_000),
    },
    {
        _id: 'm5',
        conversationID: 'c02',
        authorId: 'me',
        text: 'On it. Will PR in 10 mins.',
        sentAt: new Date(Date.now() - 118 * 60_000),
    },

    // Lina
    {
        _id: 'm6',
        conversationID: 'c03',
        authorId: 'lina',
        text: 'Can we split the milestones by roles?',
        sentAt: new Date(Date.now() - 22 * 60 * 60_000),
    },
    {
        _id: 'm7',
        conversationID: 'c03',
        authorId: 'me',
        text: 'Yep—adding designer/dev subtasks now.',
        sentAt: new Date(Date.now() - 21.5 * 60 * 60_000),
    },
];
