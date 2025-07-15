export type UserRole = 'user' | 'admin';
export type AuthProvider = 'credentials' | 'google';

export interface IUser {
    userID: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;

    role: UserRole;
    provider: AuthProvider;
    googleId?: string;

    password: string;
    oldPasswords?: string[];

    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationTokenExpiry?: Date;
    forgetPasswordToken?: string;
    forgetPasswordTokenExpiry?: Date;
    isPasswordChanged?: boolean;
    lastPasswordChange?: Date;

    lastLogin?: Date;
    image?: string;

    isActive: boolean;
    isDeleted: boolean;
    isBlocked: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISanitizedUser {
    userID: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    role: UserRole;
    isEmailVerified: boolean;
    lastLogin?: Date;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
