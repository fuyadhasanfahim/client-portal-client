import { Schema, model, models } from 'mongoose';
import { IDraftOrder, IDraftService } from '@/types/draft-order.interface';

const draftServiceSchema = new Schema<IDraftService>(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number },
        inputs: { type: Boolean, default: false },
        colorCodes: [{ type: String }],
        types: [
            {
                _id: { type: String, required: true },
                name: { type: String, required: true },
                complexity: {
                    type: {
                        _id: { type: String, required: true },
                        name: { type: String, required: true },
                        price: { type: Number, required: true },
                    },
                    required: false,
                },
            },
        ],
        complexity: {
            type: {
                _id: { type: String, required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
            },
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const draftOrderSchema = new Schema<IDraftOrder>(
    {
        userId: {
            type: String,
            ref: 'User',
            required: true,
        },
        services: [draftServiceSchema],
        isDraft: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const DraftOrderModel =
    models?.DraftOrder || model<IDraftOrder>('DraftOrder', draftOrderSchema);

export default DraftOrderModel;
