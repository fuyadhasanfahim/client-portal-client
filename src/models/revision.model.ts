import { IRevision } from '@/types/revision.interface';
import { Schema, model, models } from 'mongoose';

const RevisionSchema: Schema = new Schema<IRevision>(
    {
        orderID: {
            type: String,
            ref: 'order',
            required: true,
        },
        userID: {
            type: String,
            ref: 'user',
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const RevisionModel =
    models?.Revision || model<IRevision>('Revision', RevisionSchema);

export default RevisionModel;
