import IService, { IComplexity } from '@/types/service.interface';
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
    }
);

const serviceSchema = new Schema<IService>(
    {
        name: {
            type: String,
            required: true,
        },
        complexities: {
            type: [complexitySchema],
            default: [],
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const ServiceModel =
    models?.Service || model<IService>('Service', serviceSchema);
export default ServiceModel;
