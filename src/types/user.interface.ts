export default interface IUser {
    _id?: string;
    userId: string;
    name: string;
    username: string;
    email: string;
    phone?: string;
    role: 'User' | 'Admin' | 'SuperAdmin' | 'Developer';
    isEmailVerified: boolean;
    password: string;
    oldPasswords?: string[];
    provider: 'credentials' | 'google';
    googleId?: string;

    emailVerificationToken?: string;
    emailVerificationTokenExpiry?: Date;
    forgetPasswordToken?: string;
    forgetPasswordTokenExpiry?: Date;
    isPasswordChanged?: boolean;
    lastPasswordChange?: Date;
    lastLogin?: Date;

    profileImage?: string;
    isActive: boolean;
    isDeleted: boolean;
    isBlocked: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}
