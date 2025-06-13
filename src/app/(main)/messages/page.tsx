import RootMessages from '@/components/messages/RootMessages';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Messages | Client Portal',
};

export default function MessagesPage() {
    return <RootMessages />;
}
