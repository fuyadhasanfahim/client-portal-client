import { Schema, model, models } from 'mongoose';

const complexitySchema = new Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
    },
    { _id: false }
);

const typeSchema = new Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number },
        complexity: { type: complexitySchema, required: false },
    },
    { _id: false }
);

const serviceSchema = new Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number },
        inputs: { type: Boolean },
        colorCodes: [{ type: String }],
        options: [{ type: String }],
        types: [typeSchema],
        complexity: { type: complexitySchema },
    },
    {
        timestamps: true,
    }
);

const orderSchema = new Schema(
    {
        userId: { type: String, required: true },
        services: { type: [serviceSchema], required: true },
        downloadLink: { type: String },
        images: { type: Number },
        returnFileFormat: { type: String },
        backgroundOption: { type: String },
        imageResizing: { type: String, enum: ['Yes', 'No'] },
        width: { type: Number },
        height: { type: Number },
        instructions: { type: String },
        supportingFileDownloadLink: { type: String },
        paymentOption: { type: String },
        paymentMethod: { type: String },
        isPaid: { type: Boolean, default: false },
        status: {
            type: String,
            enum: [
                'awaiting-details',
                'awaiting-payment',
                'payment-processing',
                'confirmed',
                'in-progress',
                'completed',
                'cancelled',
            ],
            required: true,
            default: 'awaiting-details',
        },
    },
    {
        timestamps: true,
    }
);

const OrderModel = models?.Order || model('Order', orderSchema);
export default OrderModel;
