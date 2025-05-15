import IPayment from '@/types/payment.interface';
import { model, models, Schema } from 'mongoose';

const paymentSchema = new Schema<IPayment>(
    {
        userId: {
            type: String,
            ref: 'User',
            required: true,
        },
        orderId: { type: String, ref: 'Order', required: true, unique: true },
        paymentOption: { type: String, required: true },
        paymentIntentId: { type: String },
        customerId: { type: String },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        tax: { type: Number },
        totalAmount: { type: Number },
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
