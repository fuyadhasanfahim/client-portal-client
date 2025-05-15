export default interface IPayment {
    userId: string;
    orderId: string;
    paymentIntentId: string;
    customerId: string;
    amount: number;
    currency: string;
    status: string;
}
