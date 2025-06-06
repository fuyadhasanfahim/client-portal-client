export interface IMessages {
    senderID: string;
    senderName: string;
    senderProfileImage: string;
    senderRole: string;
    message: string;
    createdAt?: string;
}

export interface IRevision {
    orderID: string;
    messages: IMessages[];
    status: 'open' | 'closed' | 'in-review';
    isSeenByAdmin: boolean;
    isSeenByUser: boolean;
    createdAt?: Date;
}
