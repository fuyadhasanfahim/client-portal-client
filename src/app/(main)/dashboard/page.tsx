import RootDashboard from '@/components/dashboard/RootDashboard';
import getAuthToken from '@/utils/getAuthToken';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default async function Dashboard() {
    const token = await getAuthToken();

    return <RootDashboard authToken={token as string} />;
}
