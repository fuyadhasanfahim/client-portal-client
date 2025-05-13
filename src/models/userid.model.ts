import IUserId from '@/types/userid.interface';
import { model, models, Schema } from 'mongoose';

const UserIdSchema = new Schema<IUserId>({
    id: { type: String, required: true, unique: true },
    seq: { type: Number, default: 1000 },
});

const UserIdModel = models?.UserId || model<IUserId>('UserId', UserIdSchema);

export default UserIdModel;
