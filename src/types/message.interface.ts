export type IDeliveryStatus =
    | "sending"
    | "sent"
    | "delivered"
    | "read"
    | "failed";

export type IAttachment = {
    _id: string;
    url: string;
    mimeType: string;
    name?: string;
    sizeBytes?: number;
    width?: number;
    height?: number;
    durationSec?: number;
    thumbnailUrl?: string;
    uploadedAt: Date;
};

export type IReaction = { emoji: string; userId: string };

export type IMessage = {
    _id: string;
    conversationID: string;
    authorId: string;
    text?: string;
    sentAt: Date;
    status?: IDeliveryStatus;
    attachments?: IAttachment[];
    replyToId?: string;
    editedAt?: Date;
    deletedAt?: Date;
    reactions?: IReaction[];
    readBy?: Record<string, Date>;
};
