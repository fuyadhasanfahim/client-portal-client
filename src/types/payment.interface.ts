export default interface IPayment {
    userId: string;
    orderId: string;
    paymentOption: string;
    paymentIntentId?: string;
    customerId?: string;
    amount: number;
    currency?: string;
    status: string;
}
