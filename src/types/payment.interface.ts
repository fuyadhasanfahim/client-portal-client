import { Document } from 'mongoose';

export interface IPayment extends Document {
    paymentID: string;
    userID: string;
    orderID: string;
    paymentOption: string;
    paymentIntentID?: string;
    customerID?: string;
    amount: number;
    currency: string;
    tax: number;
    totalAmount: number;
    status: 'pending' | 'succeeded' | 'failed' | 'refunded';
    createdAt: Date;
    updatedAt: Date;
}
