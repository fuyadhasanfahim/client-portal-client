export default interface IPayment {
    userId: string;
    orderId: string;
    method: string;
    option: string;
    provider: string;
    stripePaymentIntentId: string;
    stripeCustomerId: string;
    amount: number;
    currency: string;
    status: string;
}
