import VerifyEmail from '@/components/auth/verify-email/VerifyEmail';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Verify Email | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default function VerifyEmailPage() {
    return <VerifyEmail />;
}
