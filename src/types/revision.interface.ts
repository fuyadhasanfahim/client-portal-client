export interface IRevision {
    orderID: string;
    messages: [
        {
            senderID: string;
            senderName: string;
            senderProfileImage: string;
            senderRole: string;
            message: string;
        }
    ];
    status: 'open' | 'closed' | 'in-review';
    isSeenByAdmin: boolean;
    isSeenByUser: boolean;
    createdAt?: Date;
}
