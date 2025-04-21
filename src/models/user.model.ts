import IUser from '@/types/user.interface';
import { model, models, Schema } from 'mongoose';

const UserSchema: Schema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String },
        role: {
            type: String,
            enum: ['User', 'Admin', 'SuperAdmin', 'Developer'],
            default: 'User',
        },
        isEmailVerified: { type: Boolean, default: false },
        password: {
            type: String,
            required: function () {
                return this.provider !== 'google';
            },
        },
        oldPasswords: { type: [String] },
        provider: {
            type: String,
            enum: ['credentials', 'google'],
            required: true,
        },
        googleId: { type: String, default: '' },

        emailVerificationToken: { type: String, default: '' },
        emailVerificationTokenExpiry: { type: Date, default: null },
        forgetPasswordToken: { type: String, default: '' },
        forgetPasswordTokenExpiry: { type: Date, default: null },
        isPasswordChanged: { type: Boolean, default: false },
        lastPasswordChange: { type: Date, default: null },
        lastLogin: { type: Date, default: null },

        profileImage: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },

        orders: { type: [String], default: [] },
        payments: { type: [String], default: [] },
    },
    {
        timestamps: true,
    }
);

const UserModel = models?.User || model<IUser>('User', UserSchema);
export default UserModel;
