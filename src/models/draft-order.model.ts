import { Schema, model, models } from 'mongoose';
import { IDraftOrder, IDraftService } from '@/types/draft-order.interface';

const draftServiceSchema = new Schema<IDraftService>(
    {
        name: { type: String, required: true },
        price: { type: Number },

        types: [
            {
                name: { type: String, required: true },
                complexity: {
                    name: { type: String, required: true },
                    price: { type: Number, required: true },
                },
            },
        ],

        complexity: {
            name: { type: String, required: true },
            price: { type: Number, required: true },
        },

        colorCodes: [{ type: String }],

        resizing: {
            width: { type: Number, required: true },
            height: { type: Number, required: true },
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
