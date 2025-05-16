import mongoose, { model, models } from 'mongoose';

const orderSessionSchema = new mongoose.Schema(
    {
        sessionId: { type: String, required: true, unique: true },
        fullOrder: { type: Object, required: true },
    },
    { timestamps: true }
);

const OrderSessionModel =
    models?.OrderSession || model('OrderSession', orderSessionSchema);

export default OrderSessionModel;
