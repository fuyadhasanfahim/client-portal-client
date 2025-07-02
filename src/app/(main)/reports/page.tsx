import RootReportPage from '@/components/reports/RootReportPage';
import getAuthToken from '@/utils/getAuthToken';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reports | Client Portal',
    description: 'Reports | Client Portal',
};

export default async function ReportsPage() {
    const token = await getAuthToken();

    return <RootReportPage authToken={token as string} />;
}
