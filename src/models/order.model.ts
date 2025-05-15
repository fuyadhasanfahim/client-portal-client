import { IOrder, IOrderService } from '@/types/order.interface';
import { Schema, model, models } from 'mongoose';

const OrderServiceSchema: Schema = new Schema<IOrderService>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    complexity: {
        label: { type: String },
        price: { type: Number },
    },
    types: [
        {
            title: { type: String },
        },
    ],
    colorCode: { type: String },
    width: { type: Number },
    height: { type: Number },
});

const OrderSchema: Schema = new Schema<IOrder>(
    {
        services: { type: [OrderServiceSchema], required: true },
        userId: { type: String, required: true },
        orderId: { type: String, unique: true, required: true },
        downloadLink: { type: String, required: true },
        date: { type: Date, required: true },
        numberOfImages: { type: Number, required: true },
        price: { type: Number, required: true },
        returnFormate: { type: String, required: true },
        instructions: { type: String, required: true },
        paymentOption: { type: String, required: true },
        paymentMethod: { type: String },
        isPaid: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const OrderModel = models?.Order || model<IOrder>('Order', OrderSchema);

export default OrderModel;
