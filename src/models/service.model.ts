import IService, { IComplexity, IType } from '@/types/service.interface';
import { model, models, Schema } from 'mongoose';

const complexitySchema = new Schema<IComplexity>(
    {
        label: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
        _id: false,
    }
);

const typeSchema = new Schema<IType>(
    {
        title: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        _id: false,
    }
);

const serviceSchema = new Schema<IService>(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: false,
        },
        accessibleTo: {
            type: String,
            enum: ['All', 'Custom'],
            required: true,
        },
        accessList: {
            type: [{ type: String, ref: 'User' }],
        },
        complexities: {
            type: [complexitySchema],
            default: [],
        },
        types: {
            type: [typeSchema],
            default: [],
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive', 'Pending'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

const ServiceModel =
    models?.Service || model<IService>('Service', serviceSchema);
export default ServiceModel;
