export default interface IPayment {
    userID: string;
    orderID: string;
    paymentOption: string;
    paymentIntentId?: string;
    customerId?: string;
    amount: number;
    currency?: string;
    tax?: number;
    totalAmount?: number;
    status: string;
}
