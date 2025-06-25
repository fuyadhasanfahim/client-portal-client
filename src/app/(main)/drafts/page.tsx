import RootDraft from '@/components/draft/RootDraft';
import getAuthToken from '@/utils/getAuthToken';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Drafts | Client Portal',
    description: 'Drafts | Client Portal',
};

export default async function DraftPage() {
    const authToken = await getAuthToken();

    return <RootDraft authToken={authToken as string} />;
}
