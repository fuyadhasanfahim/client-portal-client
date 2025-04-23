import ResetPassword from '@/components/auth/reset-password/ResetPassword';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reset Password | Client Portal',
    description: 'Reset your password',
};

export default function ResetPasswordPage() {
    return <ResetPassword />;
}
