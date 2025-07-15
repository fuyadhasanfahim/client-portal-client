import { Metadata } from 'next';
import RootProfile from '@/components/profile/RootProfile';

export const metadata: Metadata = {
    title: 'Profile - Account | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default async function ProfilePage() {
    return <RootProfile />;
}
