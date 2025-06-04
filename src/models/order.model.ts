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
        orderID: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        userID: { type: String, required: true },
        services: { type: [serviceSchema], required: true },
        downloadLink: { type: String, default: '', trim: true },
        images: { type: Number, default: 0 },
        returnFileFormat: { type: String, default: '', trim: true },
        backgroundOption: { type: String, default: '', trim: true },
        imageResizing: {
            type: String,
            enum: ['Yes', 'No'],
            default: 'No',
        },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        instructions: { type: String, default: '', trim: true },
        supportingFileDownloadLink: { type: String, default: '', trim: true },
        total: { type: Number, default: 0 },
        paymentOption: { type: String, default: '', trim: true },
        paymentMethod: { type: String, default: '', trim: true },
        paymentId: { type: String, default: '', trim: true },
        isPaid: { type: Boolean, default: false },
        status: {
            type: String,
            enum: [
                'Pending',
                'In Progress',
                'Delivered',
                'In Revision',
                'Completed',
                'Canceled',
            ],
            required: true,
            default: 'Pending',
        },
        paymentStatus: {
            type: String,
            enum: [
                'Pending',
                'Pay Later',
                'Paid',
                'Payment Failed',
                'Refunded',
            ],
            required: true,
            default: 'Pending',
        },
        deliveryDate: {
            type: Date,
        },
        orderStatus: {
            type: String,
            enum: [
                'Awaiting For Details',
                'Waiting For Approval',
                'Accepted',
                'Canceled',
            ],
            required: true,
            default: 'Awaiting For Details',
        },
    },
    { timestamps: true }
);

const OrderModel = models?.Order || model('Order', orderSchema);
export default OrderModel;
