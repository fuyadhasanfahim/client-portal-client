import IPayment from '@/types/payment.interface';
import { model, models, Schema } from 'mongoose';

const paymentSchema = new Schema<IPayment>(
    {
        userId: {
            type: String,
            ref: 'User',
            required: true,
        },
        orderId: { type: String, ref: 'Order' },
        method: { type: String, enum: ['stripe'], required: true },
        option: {
            type: String,
            enum: ['Pay Later', 'Pay Now'],
            required: true,
        },
        provider: {
            type: String,
            enum: ['Visa', 'Master Card', 'Paypal', 'American Express'],
        },
        stripePaymentIntentId: { type: String },
        stripeCustomerId: { type: String },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        status: {
            type: String,
            enum: ['Pending', 'Succeeded', 'Failed'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const PaymentModel =
    models?.Payment || model<IPayment>('Payment', paymentSchema);
export default PaymentModel;
